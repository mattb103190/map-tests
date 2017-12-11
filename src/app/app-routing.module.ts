import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: 'routing', pathMatch: 'prefix', loadChildren: './routing/routing/routing.module#RoutingModule' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule],
    providers: [
    ]
})
export class AppRoutingModule { }
