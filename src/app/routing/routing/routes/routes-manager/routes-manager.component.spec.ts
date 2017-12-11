import { TestBed, inject, async, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { Observable } from 'rxjs/Observable';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiModule, SessionService } from '../../../../api/index';
import { SharedModule } from '../../../../shared/shared.module';
import { RoutesManagerComponent } from './routes-manager.component';
import { RouteService, StopService, MockRouteService, MockStopService, OrganizationService, MockOrganizationService } from '../../../../api/index';
import { MapModule } from '../../../../map/map.module';
import { ColorPickerModule } from 'ngx-color-picker';
import * as L from 'leaflet';

fdescribe('RoutesManagerComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                MomentModule,
                NgbModule.forRoot(),
                ApiModule.forRoot(true),
                ReactiveFormsModule,
                RouterTestingModule,
                SharedModule.forRoot(),
                NgbModalModule,
                ColorPickerModule,
                MapModule
            ],
            declarations: [
                RoutesManagerComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        this.fixture = TestBed.createComponent(RoutesManagerComponent);
        this.compInstance = this.fixture.componentInstance;
        this.compiled = this.fixture.debugElement.nativeElement;
        this.routeService = TestBed.get(RouteService);

        spyOn(this.routeService, 'getDropdownOptions').and.callThrough();
        spyOn(this.routeService, 'create').and.callThrough();
        spyOn(this.routeService, 'update').and.callThrough();

        spyOn(this.compInstance, 'clearMap').and.callThrough();
        spyOn(this.compInstance, 'loadStops').and.callThrough();
        spyOn(this.compInstance, 'loadRoute').and.callThrough();
        spyOn(this.compInstance, 'createLeg').and.callThrough();
        spyOn(this.compInstance, 'setRoute').and.callThrough();
        spyOn(this.compInstance, 'ngOnInit').and.callThrough();
        spyOn(this.compInstance, 'save').and.callThrough();
        spyOn(this.compInstance, 'removeLeg').and.callThrough();
        spyOn(this.compInstance, 'onMapClicked').and.callThrough();
        spyOn(this.compInstance, 'addPointToEndOfLegPath').and.callThrough();
        spyOn(this.compInstance, 'addWaypointToLegAtIdx').and.callThrough();
        spyOn(this.compInstance, 'onStopClicked').and.callThrough();
        spyOn(this.compInstance, 'convertPointToWaypoint').and.callThrough();
        spyOn(this.compInstance, 'findNearestSegmentOnPath').and.callThrough();
        spyOn(this.compInstance, 'findClosestPointOnPathForLeg').and.callThrough();
        spyOn(this.compInstance, 'createWaypoint').and.callThrough();
        spyOn(this.compInstance, 'OnWaypointMoved').and.callThrough();
        spyOn(this.compInstance, 'OnWaypointMoveCompleted').and.callThrough();
        spyOn(this.compInstance, 'appendLegToRoute').and.callThrough();
        spyOn(this.compInstance, 'updateLegDurationAndDistance').and.callThrough();
        spyOn(this.compInstance, 'changeRouteColor').and.callThrough()
        spyOn(this.compInstance, 'getCoordsPriorToNewWaypoint').and.callThrough();
        spyOn(this.compInstance, 'findPath').and.callThrough();

        this.fixture.detectChanges();
    });

    it(`should define component instance`, (done => {
        this.compInstance.mapComponent.getNativeInstance().then(map => {
            expect(this.fixture.componentInstance).toBeDefined();
            expect(this.compInstance.ngOnInit).toHaveBeenCalled();
            expect(this.routeService.getDropdownOptions).toHaveBeenCalled();

            expect(this.fixture.componentInstance.messages).not.toBeNull();
            expect(this.fixture.componentInstance.messages.length).toEqual(0);
            done();
        });
    }));

    it(`should contain the correct leg when clicking stops`, (done => {
        this.compInstance.mapComponent.getNativeInstance().then(map => {
            this.compInstance.stopLayer.getLayers()[0].fire('click', { latlng: <any>([31.2284724615694, -85.4321765899658]) });
            this.compInstance.stopLayer.getLayers()[1].fire('click', { latlng: <any>([31.2490940369638, 85.4247093200683]) });

            expect(this.compInstance.onStopClicked).toHaveBeenCalled();

            expect(this.fixture.componentInstance.routeLegs[0].origin_stop).toEqual(
                { id: 1, name: 'Org1_stop1', code: 'o1-one', description: 'org1 first stop', url: null, location_type: 'stop', has_wheelchair_boarding: null, geometry: Object({ type: 'Point', coordinates: [-85.4321765899658, 31.2284724615694] }), boundary: Object({ type: 'Polygon', coordinates: [[[-85.4324126243591, 31.2282339294713], [-85.4318976402283, 31.2282339294713], [-85.4318976402283, 31.2288486071163], [-85.4324126243591, 31.2288486071163], [-85.4324126243591, 31.2282339294713]]] }) }
            );

            expect(this.fixture.componentInstance.routeLegs[0].destination_stop).toEqual(
                { id: 2, name: 'Org1_stop2', code: 'o1-two', description: 'org1 second stop', url: null, location_type: 'stop', has_wheelchair_boarding: null, geometry: Object({ type: 'Point', coordinates: [-85.4247093200683, 31.2490940369638] }), boundary: Object({ type: 'Polygon', coordinates: [[[-85.4248702526092, 31.2489472800928], [-85.4245215654373, 31.2489472800928], [-85.4245215654373, 31.2493416886665], [-85.4248702526092, 31.2493416886665], [-85.4248702526092, 31.2489472800928]]] }) }
            );

            this.fixture.detectChanges();

            expect(this.compInstance.onStopClicked).toHaveBeenCalled();
            expect(this.compInstance.appendLegToRoute).toHaveBeenCalled();
            expect(this.compInstance.updateLegDurationAndDistance).toHaveBeenCalled();

            done();
        });
    }));

    it(`should clear map when button is clicked`, (done => {
        this.compInstance.mapComponent.getNativeInstance().then(map => {
            this.compiled.querySelector('#clear-btn').click();
            expect(this.compInstance.clearMap).toHaveBeenCalled();
            done();
        });
    }));
});
