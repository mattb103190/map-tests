import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { Ng2CompleterModule } from "ng2-completer";
import { ColorPickerModule } from 'ngx-color-picker';

import { SharedModule } from '../../shared/shared.module';
import { ApiModule } from '../../api/index';
import { MapModule } from '../../map/map.module';
import { RoutingRoutingModule } from './routing-routing.module';

import { StopsBulkUploadComponent } from './stops/stops-bulk-upload/stops-bulk-upload.component';
import { StopsEditComponent } from './stops/stops-edit/stops-edit.component';
import { StopsCreateComponent } from './stops/stops-create/stops-create.component';

import { CalendarsListComponent } from './calendars/calendars-list/calendar-list.component';
import { CalendarCreateComponent } from './calendars/calendars-form/calendar-create-modal.component';
import { CalendarEditComponent } from './calendars/calendars-form/calendar-edit-modal.component';

import { TripsListComponent } from './trips/trips-list/trips-list.component';
import { TripCreateComponent } from './trips/trips-form/trips-create-modal.component';
import { TripEditComponent } from './trips/trips-form/trips-edit-modal.component';

import { RoutesListComponent } from './routes/routes-list/routes-list.component';
import { RoutesManagerComponent } from './routes/routes-manager/routes-manager.component';
import { ActiveRoutesComponent } from './routes/routes-active/routes-active.component';

import { RoutingNavComponent } from './routing-nav/routing-nav.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MapModule,
        NgbModule,
        NgbModalModule,
        NgbCollapseModule,
        FileUploadModule,        
        SharedModule,
        Ng2CompleterModule,
        ColorPickerModule,
        RoutingRoutingModule
    ],
    providers: [],
    declarations: [
        StopsBulkUploadComponent,
        StopsEditComponent,
        StopsCreateComponent,
        CalendarsListComponent,
        CalendarCreateComponent,
        CalendarEditComponent,
        TripsListComponent,
        TripCreateComponent,
        TripEditComponent,
        RoutesListComponent,
        RoutesManagerComponent,
        ActiveRoutesComponent,
        RoutingNavComponent
    ],
    entryComponents: [
        CalendarCreateComponent,
        CalendarEditComponent,
        TripCreateComponent,
        TripEditComponent
    ]
    // bootstrap: [AppComponent]
})
export class RoutingModule {
}
