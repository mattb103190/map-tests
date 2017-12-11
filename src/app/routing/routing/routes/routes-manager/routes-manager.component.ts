import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import * as moment from 'moment';
import 'moment-duration-format';

import 'leaflet-contextmenu';
import { Point } from 'leaflet';
import * as L from 'leaflet';

import { StopService, Stop, Route, RouteService } from '../../../../api/index';
import { AlertMessage, SubmittableFormGroup, LoggerService } from '../../../../shared/index';
import { BaseMapComponent, OsrmRouteService } from '../../../../map/index';
import { ActivatedRouteSnapshot } from '@angular/router';

@Component({
    selector: 'mtx-routes-designer',
    templateUrl: './routes-manager.html',
    styleUrls: ['./routes-manager.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesManagerComponent implements OnInit, OnDestroy {

    @ViewChild(BaseMapComponent) mapComponent: BaseMapComponent;

    mode: 'auto' | 'manual' = 'manual';
    messages: AlertMessage[] = [];

    map: L.Map;
    stopLayer: L.FeatureGroup = L.featureGroup([]);
    waypointLayer: L.FeatureGroup = L.featureGroup([]);
    routeLayer: L.FeatureGroup = L.featureGroup([]);
    previewChangeLayer: L.FeatureGroup = L.featureGroup([]);
    devLayer: L.FeatureGroup = L.featureGroup([]);
    routeLegs: RouteLeg[] = [];
    autoModeRouteRequest: Subscription;
    routeForm: SubmittableFormGroup;
    urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    typeOptions: any;
    typeRequest: Observable<any>;
    saveRequest: Observable<Route>;
    loadingRequest: Observable<Route>;

    // , private routeParams: ActivatedRouteSnapshot
    constructor(private stopService: StopService, private osrmRouteService: OsrmRouteService, private routeService: RouteService, private activatedRoute: ActivatedRoute,
        private loggerService: LoggerService, private ref: ChangeDetectorRef) {

        this.routeForm = new SubmittableFormGroup({
            id: new FormControl('', []),
            name: new FormControl('', [Validators.maxLength(32), Validators.required]),
            long_name: new FormControl('', [Validators.maxLength(65)]),
            description: new FormControl(''),
            type: new FormControl('', [Validators.required]),
            text_color: new FormControl(''),
            color: new FormControl(''),
            url: new FormControl('', [Validators.pattern(this.urlRegex)])
        });

        this.loadStops();
    }

    ngOnInit() {
        this.routeForm.controls['text_color'].setValue('#ffffff');
        this.routeForm.controls['color'].setValue('#000000');

        this.typeRequest = this.routeService.getDropdownOptions();
        this.typeRequest.subscribe(
            res => {
                this.typeRequest = null;
                this.typeOptions = res.typeOptions;
            },
            error => {
                this.typeRequest = null;
                this.messages = this.loggerService.apiErrorsToDisplayErrors(error);
            });

        this.mapComponent.getNativeInstance().then(map => {
            if (!map) {
                return;
            }

            this.map = map;

            map.addLayer(this.stopLayer);
            map.addLayer(this.waypointLayer);
            map.addLayer(this.routeLayer);
            map.addLayer(this.previewChangeLayer);
            map.addLayer(this.devLayer);

            this.map.on('click', this.onMapClicked.bind(this));

            if (this.map && this.stopLayer.getLayers().length > 0 && this.stopLayer.getBounds().isValid()) {
                this.map.fitBounds(this.stopLayer.getBounds());
            }
        });
    }

    ngOnDestroy() {
        this.clearMap();
    }

    loadRoute(id: number) {
        this.loadingRequest = this.routeService.getById(id);
        this.loadingRequest.subscribe(route => {
            this.setRoute(route);
        },
            error => {
                this.messages = this.loggerService.mapFormGroupToErrors(this.routeForm);
                this.loadingRequest = null;
            });
    }

    setRoute(route: Route) {
        this.routeForm = new SubmittableFormGroup({
            id: new FormControl(route.id, []),
            name: new FormControl(route.name, [Validators.maxLength(32), Validators.required]),
            long_name: new FormControl(route.long_name, [Validators.maxLength(65)]),
            description: new FormControl(route.description),
            type: new FormControl(route.type, [Validators.required]),
            text_color: new FormControl(route.text_color),
            color: new FormControl(route.color),
            url: new FormControl(route.url, [Validators.pattern(this.urlRegex)])
        });


        for (let i = 0; i < route.legs.length; i++) {
            let leg = {
                origin_stop: (<StopMarker>_.find(this.stopLayer.getLayers(), (stopMarker: StopMarker) => {
                    return stopMarker.stop.id === route.legs[i].origin_stop.id
                })).stop,
                destination_stop: (<StopMarker>_.find(this.stopLayer.getLayers(), (stopMarker: StopMarker) => {
                    return stopMarker.stop.id === route.legs[i].dest_stop.id
                })).stop,
                waypoints: <WayPointmarker[]>[],
                path: L.polyline([]),
                duration: route.legs[i].travel_time,
                distance: 0.00,
                formatted_duration: '0 hours 0 minutes'
            }

            const path: L.LatLng[] = [];
            for (let k = 0; k < route.legs[i].path.coordinates.length; k++) {
                path.push(L.latLng([
                    route.legs[i].path.coordinates[k][1],
                    route.legs[i].path.coordinates[k][0],
                ]));
            }

            leg.path.setLatLngs(path);

            let routeLeg = this.createLeg(leg);

            if (route.legs[i].waypoints !== null) {
                for (let j = 0; j < route.legs[i].waypoints.coordinates.length; j++) {
                    const waypointMarker = this.createWaypoint(L.latLng([
                        route.legs[i].waypoints.coordinates[j][1],
                        route.legs[i].waypoints.coordinates[j][0]
                    ]), routeLeg, i);
                    routeLeg.waypoints.push(waypointMarker);
                    this.waypointLayer.addLayer(waypointMarker)
                };
            }

            this.routeLegs.push(routeLeg);

            this.updateLegDurationAndDistance(routeLeg);

            this.map.invalidateSize(true);

            this.ref.detectChanges();
            this.ref.markForCheck();
        }

        if (route.legs[0].origin_stop.id !== route.legs[route.legs.length - 1].dest_stop.id) {
            // when setting the route if the legs[0].origin_stop.id !== legs[legs.length-1].destination_stop.id
            // then add an additional leg with no waypoints and a null destination_stop

            const newLegOriginStop = (<StopMarker>_.find(this.stopLayer.getLayers(), (stopMarker: StopMarker) => {
                return stopMarker.stop.id === route.legs[route.legs.length - 1].dest_stop.id;
            })).stop;

            this.appendLegToRoute(newLegOriginStop, null, [], L.polyline([]), 0);
        }

        this.loadingRequest = null;
    }

    save() {
        if (this.saveRequest || this.routeLegs.length === 0) {
            return;
        }

        this.routeForm.submitted = true;
        this.messages = [];

        if (!this.routeForm.valid) {
            this.messages = this.loggerService.mapFormGroupToErrors(this.routeForm);
            return;
        }

        if (this.routeLegs[this.routeLegs.length - 1].destination_stop === null) {
            if (this.routeLegs.length === 1) {
                this.messages.push({ type: 'danger', msg: 'Please complete at least one route leg.' });
            } else {
                this.routeLegs.splice(this.routeLegs.length - 1, 1);
            }
        }

        const route = {
            id: null,
            name: this.routeForm.value.name,
            long_name: this.routeForm.value.long_name,
            description: this.routeForm.value.description,
            type: this.routeForm.value.type,
            color: this.routeForm.value.color,
            text_color: this.routeForm.value.text_color,
            url: this.routeForm.value.url,
            legs: [],
        };

        for (let i = 0; i < this.routeLegs.length; i++) {
            const leg = {
                origin_stop: {
                    id: this.routeLegs[i].origin_stop.id,
                    name: this.routeLegs[i].origin_stop.name,
                    geometry: this.routeLegs[i].origin_stop.geometry,
                    boundary: this.routeLegs[i].origin_stop.boundary
                },
                dest_stop: {
                    id: this.routeLegs[i].destination_stop.id,
                    name: this.routeLegs[i].destination_stop.name,
                    geometry: this.routeLegs[i].destination_stop.geometry,
                    boundary: this.routeLegs[i].destination_stop.boundary
                },
                waypoints: null,
                path: {
                    type: "LineString",
                    coordinates: []
                },
                travel_time: this.routeLegs[i].duration
            };

            if (this.routeLegs[i].waypoints.length > 0) {
                leg.waypoints = {
                    type: "MultiPoint",
                    coordinates: []
                };

                for (let j = 0; j < this.routeLegs[i].waypoints.length; j++) {
                    leg.waypoints.coordinates.push([this.routeLegs[i].waypoints[j].getLatLng().lng, this.routeLegs[i].waypoints[j].getLatLng().lat]);
                }
            }

            let path = this.routeLegs[i].path.getLatLngs();

            for (let k = 0; k < path.length; k++) {
                leg.path.coordinates.push([path[k].lng, path[k].lat]);
            }

            route.legs.push(leg);
        }


        if (this.routeForm.value.id) {
            // if form group has an id then send to service update
            route.id = this.routeForm.value.id;

            this.saveRequest = this.routeService.update(route);

            this.saveRequest.subscribe(() => {
                this.saveRequest = null;
                this.routeForm.submitted = false;

                this.messages.push({ type: 'success', msg: 'Route saved.' });
                this.routeForm.reset();
                this.clearMap();
                
                this.ref.detectChanges();
                this.ref.markForCheck();
            },
                err => {
                    this.saveRequest = null;
                    this.messages = this.loggerService.apiErrorsToDisplayErrors(err);
                });

        } else {
            // otherwise send to service create
            delete route.id;

            this.saveRequest = this.routeService.create(route);

            this.saveRequest.subscribe(() => {
                this.saveRequest = null;
                this.routeForm.submitted = false;

                this.messages.push({ type: 'success', msg: 'Route saved.' });

                this.routeForm.reset();
                this.clearMap();

                this.ref.detectChanges();
                this.ref.markForCheck();
            },
                err => {
                    this.saveRequest = null;
                    this.messages = this.loggerService.apiErrorsToDisplayErrors(err);
                });
        }
    }

    private loadStops() {
        return this.stopService.search({ limit: 1000 })
            .subscribe(
            response => {
                for (let i = 0; i < response.data.length; i++) {

                    // to do, pass in context menu options
                    // should trigger deleting entire leg???
                    // set previous leg dest to stop of next leg
                    // update path of previous leg, if not prev leg then huzzah
                    // on second thought this shouldnt happen here, deleting leg should
                    // occur from the list incase user hits same stop twice (do we allow that??)
                    const marker = new StopMarker(response.data[i]);

                    marker.addEventListener('click', (evt: MouseEvent) => this.onStopClicked(evt));
                    this.stopLayer.addLayer(marker);
                }

                if (this.map && this.stopLayer.getLayers().length > 0 && this.stopLayer.getBounds().isValid()) {
                    this.map.fitBounds(this.stopLayer.getBounds());
                }

                if (this.activatedRoute.snapshot.params.id) {
                    this.loadRoute(this.activatedRoute.snapshot.params.id);
                }
            },
            error => {
                this.messages.push({ type: 'error', msg: 'Error loading stops' })
            });
    }

    createLeg(leg) {
        const color = this.routeForm.value.color;
        const newLeg: RouteLeg = {
            origin_stop: leg.origin_stop,
            destination_stop: leg.destination_stop ? leg.destination_stop : null,
            waypoints: leg.waypoints ? leg.waypoints : [],
            path: leg.path ? leg.path : L.polyline([]),
            duration: leg.duration,
            distance: 0.00,
            formatted_duration: '0 hours 0 minutes'
        };

        newLeg.path.setStyle({ color: color, weight: 5 });

        newLeg.path.addEventListener('convertPointToWaypoint', (mEvt: MouseEvent) => this.convertPointToWaypoint(mEvt, newLeg));
        L.DomEvent.disableClickPropagation(<any>newLeg.path);
        newLeg.path.addEventListener('click', function (mEvt) {
            L.DomEvent.stopPropagation(<any>mEvt); this.fire('convertPointToWaypoint', mEvt);
        });

        this.routeLayer.addLayer(newLeg.path);

        return newLeg;
    }

    removeLeg(leg: RouteLeg) {
        const legIdx = this.routeLegs.indexOf(leg);
        const deletingFirstLeg = legIdx === 0;
        const deletingLastLeg = legIdx === this.routeLegs.length - 1;
        const nextLeg = deletingLastLeg ? null : this.routeLegs[legIdx + 1];
        const prevLeg = deletingFirstLeg ? null : this.routeLegs[legIdx - 1];

        // remove the leg
        for (let i = 0; i < leg.waypoints.length; i++) {
            leg.waypoints[i].clearAllEventListeners();
            leg.waypoints[i].remove();
        }

        leg.path.clearAllEventListeners();
        leg.path.remove();
        this.routeLegs.splice(legIdx, 1);

        if (deletingFirstLeg) {
            // we have nothing else to do as it doesn't affect any other legs
            return;
        }

        if (prevLeg !== null && deletingLastLeg) {
            // if we delete the last leg we need to clean up the path
            // and waypoints because they were going towards the leg
            // that we are deleting

            for (let i = 0; i < prevLeg.waypoints.length; i++) {
                prevLeg.waypoints[i].clearAllEventListeners();
                prevLeg.waypoints[i].remove();
            }

            prevLeg.destination_stop = null;
            prevLeg.path.setLatLngs([]);
        }

        if (prevLeg !== null && nextLeg !== null) {
            // if we deleted a leg and it has one before and after
            // we have to route the prevLeg to the nextLeg

            for (let i = 0; i < prevLeg.waypoints.length; i++) {
                prevLeg.waypoints[i].clearAllEventListeners();
                prevLeg.waypoints[i].remove();
            }

            prevLeg.destination_stop = nextLeg.origin_stop;


            const originCoords = L.latLng([prevLeg.origin_stop.geometry.coordinates[1], prevLeg.origin_stop.geometry.coordinates[0]]);
            const destCoords = L.latLng([prevLeg.destination_stop.geometry.coordinates[1], prevLeg.destination_stop.geometry.coordinates[0]]);

            if (this.mode === 'manual') {
                prevLeg.path.setLatLngs([originCoords, destCoords]);
            } else if (this.mode === 'auto') {
                this.findPath(originCoords, destCoords)
                    .subscribe(pathSegement => {
                        prevLeg.path.setLatLngs(pathSegement);
                    });
            }
        }
    }

    clearMap() {
        this.waypointLayer.clearAllEventListeners();
        this.waypointLayer.clearLayers();

        this.routeLayer.clearAllEventListeners();
        this.routeLayer.clearLayers();

        this.previewChangeLayer.clearAllEventListeners();
        this.previewChangeLayer.clearLayers();

        for (let i = 0; i < this.routeLegs.length; i++) {
            this.routeLegs[i].path.clearAllEventListeners();
            this.routeLegs[i].path.remove();

            for (let j = 0; j < this.routeLegs[i].waypoints.length; j++) {
                this.routeLegs[i].waypoints[j].clearAllEventListeners();
                this.routeLegs[i].waypoints[j].remove();
            }
        }

        this.map.invalidateSize(true);

        this.routeLegs = [];
    }

    // This event should occur when a user is trying to extend the last leg of the route
    private onMapClicked(evt: MouseEvent) {
        if (this.routeLegs.length === 0) {
            return;
        }

        if (this.routeLegs[0].origin_stop && this.routeLegs[this.routeLegs.length - 1].destination_stop) {
            if (this.routeLegs.length > 0 && this.routeLegs[this.routeLegs.length - 1].destination_stop.id === this.routeLegs[0].origin_stop.id) {
                // the route has been finalized do not add another leg, this may end up being a problem if
                // a route goes to a single stop more than once
                this.messages.push({
                    type: 'danger',
                    msg: 'Route has been finalized. Last stop is the first stop. No waypoints can be added to the end of the route'
                });
                return;
            }
        }

        const tgtLegIdx = this.routeLegs.length - 1;
        const clickedLatLng = (<any>evt).latlng; // typescript def missing latlng property

        this.addPointToEndOfLegPath(clickedLatLng, this.routeLegs[tgtLegIdx]);
        this.addWaypointToLegAtIdx(clickedLatLng, this.routeLegs[tgtLegIdx], this.routeLegs[tgtLegIdx].waypoints.length);

        this.updateLegDurationAndDistance(this.routeLegs[tgtLegIdx]);
    }

    // when a stop is clicked, we finalize the last leg and add a new leg
    private onStopClicked(evt: MouseEvent) {
        this.messages = [];

        const clickedLatLng: L.LatLng = (<any>evt).latlng;
        const selectedStop: StopMarker = <any>evt.target;


        // if have a leg then finalize the leg
        if (this.routeLegs.length > 0 && this.routeLegs[this.routeLegs.length - 1].destination_stop === null) {
            this.routeLegs[this.routeLegs.length - 1].destination_stop = selectedStop.stop;

            this.addPointToEndOfLegPath(clickedLatLng, this.routeLegs[this.routeLegs.length - 1]);
        }

        if (this.routeLegs.length > 0 && this.routeLegs[this.routeLegs.length - 1].destination_stop.id === this.routeLegs[0].origin_stop.id) {
            // the route has been finalized do not add another leg, this may end up being a problem if
            // a route goes to a single stop more than once
            this.messages.push({
                type: 'success',
                msg: 'Route has been finalized. Last stop is the first stop. No more stops can be added'
            });
            return;
        }

        this.updateLegDurationAndDistance(this.routeLegs[this.routeLegs.length - 1]);
        this.appendLegToRoute(selectedStop.stop, null, [], L.polyline([]), 0);
    }

    private appendLegToRoute(originStop: Stop, destinationStop: Stop, waypoints: WayPointmarker[], path: L.Polyline, duration: number) {
        // tslint:disable-next-line:no-bitwise
        const color = this.routeForm.value.color;
        const newLeg: RouteLeg = {
            origin_stop: originStop,
            destination_stop: destinationStop ? destinationStop : null,
            waypoints: waypoints ? waypoints : [],
            path: path ? path : L.polyline([]),
            duration: duration,
            distance: 0.00,
            formatted_duration: '0 hours 0 minutes'
        };

        newLeg.path.setStyle({ color: color, weight: 5 });

        newLeg.path.addEventListener('convertPointToWaypoint', (mEvt: MouseEvent) => this.convertPointToWaypoint(mEvt, newLeg));
        L.DomEvent.disableClickPropagation(<any>newLeg.path);
        newLeg.path.addEventListener('click', function (mEvt) {
            L.DomEvent.stopPropagation(<any>mEvt); this.fire('convertPointToWaypoint', mEvt);
        });

        this.routeLayer.addLayer(newLeg.path);

        this.routeLegs.push(newLeg);

        this.updateLegDurationAndDistance(newLeg);

        this.map.invalidateSize(true);
        this.ref.detectChanges();
        this.ref.markForCheck();
    }

    // for auto mode, find path that follows road network
    private findPath(a: L.LatLng, b: L.LatLng): Observable<L.LatLng[]> {
        return this.osrmRouteService
            .search('transit', [[a.lng, a.lat], [b.lng, b.lat]], { geometries: 'geojson' })
            .map(result => {
                return result.routes[0].geometry.coordinates.map(coord => new L.LatLng(coord[1], coord[0]))
            })
    }

    // used as helper for auto mode when extending a leg with a waypoint
    private getCoordsPriorToNewWaypoint(leg: RouteLeg) {
        if (leg.waypoints.length > 0) {
            return leg.waypoints[leg.waypoints.length - 1].getLatLng();
        } else {
            return L.latLng(leg.origin_stop.geometry.coordinates[1], leg.origin_stop.geometry.coordinates[0]);
        }
    }

    // todo: prevent overlapping requests in auto mode
    // add a new waypoint at the end of a leg
    private addPointToEndOfLegPath(coord: L.LatLng, leg: RouteLeg) {
        if (this.mode === 'manual') {
            const path = leg.path.getLatLngs();

            if (path.length === 0) {
                path.push(L.latLng(leg.origin_stop.geometry.coordinates[1], leg.origin_stop.geometry.coordinates[0]));
            }

            path.push(coord);

            leg.path.setLatLngs(path);

            return Observable.of(true);
        } else {
            const lastPointOnLeg = this.getCoordsPriorToNewWaypoint(leg);

            this.findPath(lastPointOnLeg, coord)
                .subscribe(
                pathToPoint => {
                    const newLegPath = leg.path.getLatLngs().concat(pathToPoint);
                    leg.path.setLatLngs(newLegPath);
                },
                error => {
                    this.messages.push({ type: 'error', msg: 'Unable to find path for that segment, please try manual mode' })
                }
                );
        }
    }

    /* we could do a context action on a leg
       that would allow us to clear all waypoints
       and then auto route incase user wants to
       optimize an existing leg */

    // moveLeg(leg: RouteLeg, newIdx: number) {
    // drag to reorder, move up down action would utilize this
    // this wouldn't be too different than deleting a leg except
    // instead of only modifying 1 leg we would be modifying up to 3,
    // the leg that comes before so that it's destination stop
    // is the one we just moved, the one
    // we just moved to adjust its destination
    // and the one that used to come before the one we just moved
    // to point to the one that used to come after or the destination stop
    // }

    /*
        undo/redo behavior:
        after every action we need to push the routeLegs
        into a history array, we also need a pointer (number)
        to point to the position in the history array that we
        are currently displaying. On undo we decrement the
        pointer to previous index in history array, clearMap() and pass
        the routeLegs into a method that puts them on the map.
        When making a change, if the pointer is at the end of the array
        we would push the new routeLegs object into the array, if the pointer
        is not to the last item in the history array then we delete everything
        after the pointer and then push the new changes. The main problem
        with this approach will be shared objects, changing an item in routeLegs
        will change it in the history since everythign would be by reference
        so before any changes we would need to CLONE routeLegs?
    */

    private removeWaypoint(tgtWaypoint: WayPointmarker) {
        const tgtWaypointIdx = tgtWaypoint.leg.waypoints.indexOf(tgtWaypoint);
        let deletePathStartIdx = -1;
        let deletePathEndIdx = -1;
        const prevWaypoint = tgtWaypointIdx === 0 ? null : tgtWaypoint.leg.waypoints[tgtWaypointIdx - 1];
        const nextWaypoint = tgtWaypointIdx === tgtWaypoint.leg.waypoints.length - 1 ? null : tgtWaypoint.leg.waypoints[tgtWaypointIdx + 1];

        // compute the above
        const prevPointPathPosition = prevWaypoint ?
            this.findNearestSegmentOnPath(prevWaypoint.getLatLng(), tgtWaypoint.leg) :
            this.findNearestSegmentOnPath(L.latLng(tgtWaypoint.leg.origin_stop.geometry.coordinates[1], tgtWaypoint.leg.origin_stop.geometry.coordinates[0]), tgtWaypoint.leg);

        deletePathStartIdx = prevPointPathPosition.closestIndex + 1;

        if (tgtWaypointIdx === tgtWaypoint.leg.waypoints.length - 1) {
            deletePathEndIdx = tgtWaypoint.leg.path.getLatLngs().length;
        } else {
            // find where the next waypoint starts
            const nextWaypointPathPositionInfo = this.findNearestSegmentOnPath(
                tgtWaypoint.leg.waypoints[tgtWaypointIdx + 1].getLatLng(),
                tgtWaypoint.leg);
            deletePathEndIdx = nextWaypointPathPositionInfo.closestIndex;
        }


        // delete the segment
        const newPathStart = tgtWaypoint.leg.path.getLatLngs().slice(0, deletePathStartIdx);
        const newPathEnd = tgtWaypoint.leg.path.getLatLngs().slice(deletePathEndIdx === 0 ? 1 : deletePathEndIdx);
        const newPath = newPathStart.concat(newPathEnd);
        tgtWaypoint.leg.path.setLatLngs(newPath);

        // determine new segement
        if (this.mode === 'auto') {
            let originCoords: L.LatLng = null;
            let destCoords: L.LatLng = null;

            if (prevWaypoint === null) {
                originCoords = L.latLng(tgtWaypoint.leg.origin_stop.geometry.coordinates[1], tgtWaypoint.leg.origin_stop.geometry.coordinates[0]);
            } else {
                originCoords = prevWaypoint.getLatLng();
            }

            if (nextWaypoint !== null) {
                destCoords = nextWaypoint.getLatLng();
            } else if (tgtWaypoint.leg.destination_stop !== null) {
                destCoords = L.latLng(tgtWaypoint.leg.destination_stop.geometry.coordinates[1], tgtWaypoint.leg.destination_stop.geometry.coordinates[0]);
            }

            if (destCoords !== null) {
                this.findPath(originCoords, destCoords)
                    .subscribe(newSegmentPath => {
                        const currentPath = tgtWaypoint.leg.path.getLatLngs();
                        const pathStart = currentPath.slice(0, deletePathStartIdx);
                        const pathEnd = currentPath.slice(deletePathStartIdx, currentPath.length);
                        const fullPath = pathStart.concat(newSegmentPath).concat(pathEnd);

                        tgtWaypoint.leg.path.setLatLngs(fullPath);

                    });
            }

        }

        // remove the waypoint
        tgtWaypoint.clearAllEventListeners();
        tgtWaypoint.leg.waypoints.splice(tgtWaypointIdx, 1);
        tgtWaypoint.remove();
    }

    // todo: implement some kind of duplication checking
    private addWaypointToLegAtIdx(coords: L.LatLng, leg: RouteLeg, idx: number) {

        const marker = this.createWaypoint(coords, leg, idx);
        leg.waypoints.splice(idx, 0, marker);
        this.waypointLayer.addLayer(marker);


    }

    createWaypoint(coords: L.LatLng, leg: RouteLeg, options?: any) {
        const opts = {
            contextmenu: true,
            contextmenuItems: [{
                text: 'Remove',
                callback: (evt) => {
                    const tgtWaypoint: WayPointmarker = evt.relatedTarget;
                    this.removeWaypoint(tgtWaypoint);
                },
            }]
        };

        const marker = new WayPointmarker(coords, leg, options);

        // there is a problem where sometimes when finished dragging
        // a waypoint a map click event is fired creating a new waypoint
        // at the same location. hopefully this (the setTimeout, turning click on/off)
        //  can be removed for a better solution
        marker.addEventListener('dragend', (evt: PointerEvent) => {
            this.OnWaypointMoveCompleted(evt, marker);

            setTimeout(() => {
                this.map.on('click', this.onMapClicked.bind(this));
            }, 50);
        });
        marker.addEventListener('drag', (evt: PointerEvent) => this.OnWaypointMoved(evt, marker));
        marker.addEventListener('dragstart', (evt: PointerEvent) => this.map.off('click'));

        return marker;
    }

    // update the preview of change to the leg when moving a waypoint
    private OnWaypointMoved(e: PointerEvent, marker: WayPointmarker) {
        if (this.autoModeRouteRequest) {
            this.autoModeRouteRequest.unsubscribe();
            this.autoModeRouteRequest = null;
        }

        const myNewCoords = (<any>e).latlng; // typescript missing latlng attr
        marker.setLatLng(myNewCoords);

        const myIdx = marker.leg.waypoints.indexOf(marker);
        let startCoords: L.LatLng = null;
        let endCoords: L.LatLng = null;

        if (myIdx === 0) {
            startCoords = L.latLng(marker.leg.origin_stop.geometry.coordinates[1], marker.leg.origin_stop.geometry.coordinates[0]);
        } else {
            startCoords = marker.leg.waypoints[myIdx - 1].getLatLng();
        }

        if (myIdx === marker.leg.waypoints.length - 1 && marker.leg.destination_stop !== null) {
            endCoords = L.latLng(marker.leg.destination_stop.geometry.coordinates[1], marker.leg.destination_stop.geometry.coordinates[0]);
        } else if (myIdx !== marker.leg.waypoints.length - 1) {
            endCoords = marker.leg.waypoints[myIdx + 1].getLatLng();
        }

        const previewLayers = this.previewChangeLayer.clearLayers();


        if (this.mode === 'auto') {
            const tasks = [
                this.findPath(startCoords, myNewCoords)
            ];

            if (endCoords !== null) {
                tasks.push(this.findPath(myNewCoords, endCoords));
            }

            this.autoModeRouteRequest = Observable.forkJoin(tasks)
                .subscribe(paths => {
                    let fullPath = paths[0];

                    if (paths.length > 1) {
                        fullPath = fullPath.concat(paths[1]);
                    }

                    const previewLine = L.polyline(fullPath, { color: 'red', weight: 5 });
                    this.previewChangeLayer.addLayer(previewLine);

                    this.autoModeRouteRequest = null;
                });
        } else if (this.mode === 'manual') {
            const previewLine = L.polyline([startCoords, myNewCoords], { color: 'red', weight: 5 });

            if (endCoords !== null) {
                previewLine.addLatLng(endCoords);
            }

            this.previewChangeLayer.addLayer(previewLine);
        }
    }

    // review this, why is it calling findClosestWayPointOnLeg, should just be grabbing the previous and next waypoint
    // apply the new waypoint position to the leg
    private OnWaypointMoveCompleted(evt: PointerEvent, waypointMarker: WayPointmarker) {
        // return if preview line may not have been loaded yet
        if (this.autoModeRouteRequest) {
            setTimeout(() => {
                this.OnWaypointMoveCompleted(evt, waypointMarker)
            }, 50);

            return;
        }

        const myNewCoords = waypointMarker.getLatLng();
        const myIdx = waypointMarker.leg.waypoints.indexOf(waypointMarker);

        let pathStartIdx = null;
        let pathEndIdx = null;

        if (myIdx === 0) {
            pathStartIdx = 0;
        } else {
            const closestOnPathToPrevWaypoint = this.findClosestPointOnPathForLeg(waypointMarker.leg.waypoints[myIdx - 1].getLatLng(), waypointMarker.leg);
            pathStartIdx = closestOnPathToPrevWaypoint.pathIdx;
        }

        if (myIdx === waypointMarker.leg.waypoints.length - 1) {
            pathEndIdx = waypointMarker.leg.path.getLatLngs().length;
        } else {
            const closestOnPathToNextWaypoint = this.findClosestPointOnPathForLeg(waypointMarker.leg.waypoints[myIdx + 1].getLatLng(), waypointMarker.leg);
            pathEndIdx = closestOnPathToNextWaypoint.pathIdx;
        }

        const currentPath = waypointMarker.leg.path.getLatLngs();
        const pathBegin = currentPath.slice(0, pathStartIdx);
        const pathEnd = currentPath.slice(pathEndIdx, currentPath.length);
        const newSegment = (<L.Polyline>this.previewChangeLayer.getLayers()[0]).getLatLngs();
        let newPath = pathBegin.concat(newSegment);
        newPath = newPath.concat(pathEnd);

        waypointMarker.leg.path.setLatLngs(newPath);

        const previewLayers = this.previewChangeLayer.getLayers()
        for (let i = 0; i < previewLayers.length; i++) {
            previewLayers[i].clearAllEventListeners();
            previewLayers[i].remove();
        }

        this.updateLegDurationAndDistance(waypointMarker.leg);
    }

    // this is not ready
    private convertPointToWaypoint(evt: MouseEvent, leg: RouteLeg) {
        const mouseDownLatLng: L.LatLng = (<any>evt).latlng;

        // find where in the leg waypoints array we add a new waypoint
        if (leg.waypoints.length === 0) {
            // if no waypoints just add it
            this.addWaypointToLegAtIdx(mouseDownLatLng, leg, 0);
        } else {

            const closestSegmentToClickedLatLng = this.findNearestSegmentOnPath(mouseDownLatLng, leg);
            let closestSegmentClickedWaypointIdx = -1;

            if (leg.path.getLatLngs()[closestSegmentToClickedLatLng.segmentAIndex].distanceTo(mouseDownLatLng) <
                leg.path.getLatLngs()[closestSegmentToClickedLatLng.segmentAIndex].distanceTo(mouseDownLatLng)) {
                closestSegmentClickedWaypointIdx = closestSegmentToClickedLatLng.segmentAIndex;
            } else {
                closestSegmentClickedWaypointIdx = closestSegmentToClickedLatLng.segmentBIndex;
            }

            // show the clicked segment on the map
            // this.devLayer.clearLayers();
            // const segmentB = L.polyline(
            //     [leg.path.getLatLngs()[closestSegmentToClickedLatLng.segmentAIndex],
            //     leg.path.getLatLngs()[closestSegmentToClickedLatLng.segmentBIndex]],
            //     { color: 'blue', weight: 10 });
            // this.devLayer.addLayer(segmentB);

            // we know the indexes on the path we need to be between now, so now we need
            // to map the waypoints to their nearest segments, then we know which waypoints
            // to insert between
            const waypointShapeIndexes = [];

            for (let i = 0; i < leg.waypoints.length; i++) {
                const nearestSegmentToWaypoint = this.findNearestSegmentOnPath(leg.waypoints[i].getLatLng(), leg);

                waypointShapeIndexes.push({
                    segmentAIndex: nearestSegmentToWaypoint.segmentAIndex,
                    segmentBIndex: nearestSegmentToWaypoint.segmentBIndex,
                    waypointIndex: i
                });
            }

            const waypointsBefore = _.filter(waypointShapeIndexes, waypointDistanceInfo => {
                return waypointDistanceInfo.segmentBIndex <= closestSegmentClickedWaypointIdx;
            });

            if (waypointsBefore.length === 0) {
                this.addWaypointToLegAtIdx(mouseDownLatLng, leg, 0);
            } else {
                this.addWaypointToLegAtIdx(mouseDownLatLng, leg, waypointsBefore[waypointsBefore.length - 1].waypointIndex + 1);
            }

            console.log(closestSegmentClickedWaypointIdx);
        }

        // // lets not touch the shape for now, the waypoint should be falling on the line, to do it properly,
        // // we we need to find where on the leg path we need to insert the coordinates, and what coordinates
        // // would technically fall on the line closest to where the user clicked
    }

    private findNearestSegmentOnPath(searchPoint: L.LatLng, leg: RouteLeg) {
        let shortedPointAIdx = -1;
        let shortedPointBIdx = -1;
        let shortestDistance = Number.MAX_VALUE;

        const path = leg.path.getLatLngs();
        for (let i = 1; i < path.length; i++) {
            const distance = L.LineUtil.pointToSegmentDistance(
                new Point(searchPoint.lng, searchPoint.lat),
                new Point(path[i - 1].lng, path[i - 1].lat),
                new Point(path[i].lng, path[i].lat),
            )

            if (distance <= shortestDistance) {
                shortedPointAIdx = i - 1;
                shortedPointBIdx = i;
                shortestDistance = distance;
            }
        }

        const closestIdx = searchPoint.distanceTo(path[shortedPointAIdx]) < searchPoint.distanceTo(path[shortedPointBIdx]) ? shortedPointAIdx : shortedPointBIdx

        return {
            segmentAIndex: shortedPointAIdx,
            segmentBIndex: shortedPointBIdx,
            closestIndex: closestIdx
        };
    }

    // returns information about the closest point in the path to an arbitrary point,
    // if we run into problems then this probably needs to go in favor of calling
    // findNearestSegment then using the closest of the points on the segment
    private findClosestPointOnPathForLeg(coord: L.LatLng, leg: RouteLeg) {
        const pathCoords = leg.path.getLatLngs();

        if (pathCoords.length <= 1) {
            return null;
        }

        const closestPoint = {
            distance: coord.distanceTo(pathCoords[0]),
            pathIdx: 0,
            latlng: null
        };

        for (let i = 1; i < pathCoords.length; i++) {
            const myDist = coord.distanceTo(pathCoords[i]);

            if (myDist < closestPoint.distance) {
                closestPoint.distance = myDist;
                closestPoint.pathIdx = i;
                closestPoint.latlng = pathCoords[i];
            }
        }


        return closestPoint;
    }

    changeRouteColor() {
        this.routeLayer.eachLayer((layer) => {
            let polyline = layer as L.Polyline;
            polyline.setStyle({ color: this.routeForm.value.color, weight: 5 });
        })
    }

    updateLegDurationAndDistance(leg: RouteLeg) {
        if (!leg) {
            return;
        }

        // timeout to wait for osrm response
        setTimeout(() => {
            let pathLatLngs = leg.path.getLatLngs();
            let distance = 0;
            let distanceInMiles;
            let duration;
            let formattedDuration

            for (let i = 0; i < pathLatLngs.length; i++) {
                if (i + 1 === pathLatLngs.length) { break; }
                distance = distance + pathLatLngs[i].distanceTo(pathLatLngs[i + 1]);
            }

            distanceInMiles = distance / 1609.344;
            duration = (distanceInMiles / 45);
            duration = Math.ceil(duration * 60 * 60);

            formattedDuration = moment.duration(duration, 'seconds').format('h [hours] m [minutes]');

            leg.formatted_duration = formattedDuration;
            leg.duration = duration;
            leg.distance = parseInt(distanceInMiles.toFixed(2));

            this.ref.detectChanges();
            this.ref.markForCheck();
        }, 500);
    }
}

class RouteLeg {
    origin_stop: Stop;
    destination_stop: Stop;
    duration: number;
    formatted_duration: string;
    distance: number;
    waypoints: WayPointmarker[];
    path: L.Polyline;
}

class StopMarker extends L.Marker {
    public stop: Stop;

    constructor(stop: Stop) {
        const coords = [stop.geometry.coordinates[1], stop.geometry.coordinates[0]];
        const ico = L.icon({
            iconUrl: '../../assets/images/icons/bus_stop.png',
            iconSize: [25, 25]
        })

        super(coords as [number, number], { icon: ico });
        this.stop = stop;
    }
}

class WayPointmarker extends L.Marker {
    public leg: RouteLeg;

    constructor(coords: L.LatLng, leg: RouteLeg, options?: any) {
        const ico = L.icon({
            iconUrl: '../../assets/images/icons/black-point.png',
            iconSize: [25, 25]
        })

        const opts = {
            icon: ico,
            draggable: true
        };

        Object.assign(opts, options);


        super(coords, opts);
        this.leg = leg;
    }
}
