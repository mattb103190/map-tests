import {
    Component,
    ChangeDetectionStrategy,
    OnInit, OnChanges,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    NgZone,
    ElementRef,
    SimpleChanges
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Map, Layer, Control, Icon } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-search';
import 'leaflet.fullscreen';


import { AlertMessage, LoggerService } from '../../shared/index';
import { FormatAddressPipe } from '../../shared/filter-datetime-range/format-address-pipe';
import { GoogleMapsApiLoaderService } from '../google-maps-api-loader/google-maps-api-loader.service';

@Component({
    selector: 'mtx-base-map',
    template: '<div class="map"></div>',
    styles: [
        `:host >>> .leaflet-popup-content-wrapper, :host >>> .leaflet-popup-content {
            border-radius: 0 !important;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseMapComponent implements OnInit, OnChanges, OnDestroy {

    @Input() public showTraffic = false;

    // 2 way binding for inputs
    @Input() public showTrafficChange = new EventEmitter();

    createMapTask: Promise<Map>;

    // leaflet
    protected mapInstance: Map; // do not use directly, go through getNativeInstance
    private googleRoadmapLayer: Layer;
    private googleSatelliteLayer: Layer;
    private osmLayer: Layer;
    private zoomControl: Control;
    private layersControl: Control;
    private fullscreenControl: Control;
    private searchControl: Control;

    icons = {
        east: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-e.png' }),
        west: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-w.png' }),
        north: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-n.png' }),
        northeast: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-ne.png' }),
        northwest: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-nw.png' }),
        south: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-s.png' }),
        southeast: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-se.png' }),
        southwest: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active-sw.png' }),
        stay: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-active.png' }),
        offline: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-inactive.png' }),
        generic: L.icon({ iconSize: [30, 30], iconAnchor: [15, 30], iconUrl: '../assets/images/icons/marker-generic.png' }),
    };

    constructor(protected loggerService: LoggerService, protected zone: NgZone, protected elementRef: ElementRef,
        protected googleLoader: GoogleMapsApiLoaderService) {
    }

    ngOnInit() {
        this.createMap();
    }

    ngOnDestroy() {
        // check map has been initialized before clean up
        if (this.mapInstance) {

            this.mapInstance.off();
            this.googleRoadmapLayer.off();
            this.googleSatelliteLayer.off();
            this.googleRoadmapLayer.remove();
            this.googleSatelliteLayer.remove();

            this.mapInstance.remove();

            this.mapInstance = null;
            this.googleRoadmapLayer = null;
            this.googleSatelliteLayer = null;
            this.zoomControl = null;
            this.layersControl = null;
            this.fullscreenControl = null;
            this.searchControl = null;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.mapInstance) {
            return;
        }

        this.updateDisplay();
    }

    private createMap(): Promise<Map> {
        if (this.mapInstance) {
            return Promise.resolve(this.mapInstance);
        }

        if (this.createMapTask) {
            return this.createMapTask;
        }

        this.createMapTask = this.googleLoader
            .onMapReady()
            .then(resolve => {
                // setup leaflet instance
                this.mapInstance = new Map(this.elementRef.nativeElement.querySelector('.map'), {
                    zoomControl: false
                });

                this.mapInstance.on('baselayerchange', evt => {
                    this.updateDisplay();
                });

                // add tile layers
                this.googleRoadmapLayer = L.gridLayer.googleMutant({
                    type: 'roadmap' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
                });

                this.googleSatelliteLayer = L.gridLayer.googleMutant({
                    type: 'hybrid' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
                });

                this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
                    maxZoom: 18
                });

                // add base ui controls
                this.zoomControl = L.control.zoom({ position: 'bottomright' }).addTo(this.mapInstance);
                this.fullscreenControl = new (<any>L.control).fullscreen({ position: 'topright' }).addTo(this.mapInstance);

                // add layers ui control
                const layers = {
                    Roadmap: this.googleRoadmapLayer,
                    Satellite: this.googleSatelliteLayer,
                    OpenStreetMaps: this.osmLayer
                };

                // disable google mutant if no support for MutationObserver (IE10 and below)
                if (!window['MutationObserver']) {
                    delete layers.Roadmap;
                    delete layers.Satellite;
                    layers.OpenStreetMaps.addTo(this.mapInstance);
                } else {
                    layers.Roadmap.addTo(this.mapInstance);
                }

                this.layersControl = L.control.layers(layers, null, { collapsed: true, position: 'topleft' }).addTo(this.mapInstance);

                // add search control
                this.searchControl = new (<any>L).Control.Search({
                    sourceData: this.geocode,
                    formatData: this.geocodeResultToLeafletSearchResult,
                    filterData: (text, records) => records, // prevent leaflet from filtering geocoder suggested results
                    markerLocation: true,
                    autoType: false,
                    autoCollapse: true,
                    minLength: 2,
                    marker: false,
                    zoom: 15
                }).addTo(this.mapInstance);


                // set initial view
                this.mapInstance.setView(new L.LatLng(51.3, 0.7), 9);

                this.updateDisplay();

                return this.mapInstance;
            });

        return this.createMapTask;
    }

    getNativeInstance() {
        if (this.mapInstance) {
            return Promise.resolve(this.mapInstance);
        } else {
            return this.createMap();
        }
    }

    fitBounds(bounds: L.LatLngBounds) {
        if (!this.mapInstance) {
            return;
        }

        if (bounds && bounds.isValid()) {
            this.mapInstance.fitBounds(bounds);
        }
    }

    private updateDisplay() {
        if (!this.mapInstance) {
            return;
        }

        // toggle traffic
        if (this.showTraffic && this.mapInstance.hasLayer(this.googleRoadmapLayer)) {
            (<any>this.googleRoadmapLayer).addGoogleLayer('TrafficLayer');
        } else if (this.showTraffic && this.mapInstance.hasLayer(this.googleSatelliteLayer)) {
            (<any>this.googleSatelliteLayer).addGoogleLayer('TrafficLayer');
        } else {
            (<any>this.googleRoadmapLayer).removeGoogleLayer('TrafficLayer');
            (<any>this.googleSatelliteLayer).removeGoogleLayer('TrafficLayer');
        }
    }


    // geocoder for leaflet-search
    private geocode(text, callResponse) {
        // const geocoder = new google.maps.Geocoder();
        // geocoder.geocode({ address: text }, callResponse);
    }

    // convert google result to leaflet-search result
    private geocodeResultToLeafletSearchResult(googleGeocodeResults) {

        const results = {};

        for (let i = 0; i < googleGeocodeResults.length; i++) {
            const suggestion = googleGeocodeResults[i];
            const key = suggestion.formatted_address;
            const loc = L.latLng(suggestion.geometry.location.lat(), suggestion.geometry.location.lng());
            results[key] = loc;
        }

        return results;
    }
}
