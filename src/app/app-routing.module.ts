import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard.service';

export const routes: Routes = [
    { path: 'routing', pathMatch: 'prefix', loadChildren: './routing/routing/routing.module#RoutingModule' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule],
    providers: [
        AuthGuard,
    ]
})
export class AppRoutingModule { }
