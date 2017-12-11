import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapModule } from '../../map/map.module';

import { AuthGuard } from '../../auth-guard.service';

import { StopsBulkUploadComponent } from './stops/stops-bulk-upload/stops-bulk-upload.component';
import { StopsCreateComponent } from './stops/stops-create/stops-create.component';
import { StopsEditComponent } from './stops/stops-edit/stops-edit.component';
import { CalendarsListComponent } from './calendars/calendars-list/calendar-list.component';
import { TripsListComponent } from './trips/trips-list/trips-list.component';
import { RoutesListComponent } from './routes/routes-list/routes-list.component';
import { RoutesManagerComponent } from './routes/routes-manager/routes-manager.component';
import { ActiveRoutesComponent } from './routes/routes-active/routes-active.component';

export const routes: Routes = [
    { path: 'stops/import', component: StopsBulkUploadComponent, canActivate: [AuthGuard] },
    { path: 'stops/create', component: StopsCreateComponent, canActivate: [AuthGuard] },    
    { path: 'stops/edit', component: StopsEditComponent, canActivate: [AuthGuard] },
    { path: 'calendars', component: CalendarsListComponent, canActivate: [AuthGuard] },
    { path: 'trips', component: TripsListComponent, canActivate: [AuthGuard] },
    { path: 'routes', component: RoutesListComponent, canActivate: [AuthGuard] },
    { path: 'routes/create', component: RoutesManagerComponent, canActivate: [AuthGuard] },    
    { path: 'routes/:id/edit', component: RoutesManagerComponent, canActivate: [AuthGuard] },
    { path: 'routes/active', component: ActiveRoutesComponent, canActivate: [AuthGuard] }    
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        MapModule
    ],
    exports: [
        RouterModule
    ]
})
export class RoutingRoutingModule { }
