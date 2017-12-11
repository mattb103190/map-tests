import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapModule } from '../../map/map.module';

import { AuthGuard } from '../../auth-guard.service';

import { RoutesManagerComponent } from './routes/routes-manager/routes-manager.component';

export const routes: Routes = [
    { path: 'routes/create', component: RoutesManagerComponent, canActivate: [AuthGuard] },    
    { path: 'routes/:id/edit', component: RoutesManagerComponent, canActivate: [AuthGuard] }
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
