import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MapModule } from './map/index';

import * as Raven from 'raven-js';
import { environment } from '../environments/environment';

declare var require: any;
const { version: appVersion } = require('../../package.json');

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,

        NgbModule.forRoot(),

        // eager load modules
        MapModule.forRoot(),
        SharedModule.forRoot(),
        ApiModule,

        // lazy load modules

        AppRoutingModule
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }