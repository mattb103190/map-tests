import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard.service';
import { AppRoutingModule } from './app-routing.module';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MapModule } from './map/index';

import * as Raven from 'raven-js';
import { environment } from '../environments/environment';

declare var require: any;
const { version: appVersion } = require('../../package.json');

export class RavenErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        Raven.captureException(err.originalError || err);
    }
}

export class DevErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        console.log(err);
    }
}

export function errorHandlerServiceFactory() {
    try {

        if (environment.raven) {

            Raven
                .config(environment.raven, {
                    release: appVersion
                })
                .install();

            return new RavenErrorHandler();
        } else {
            return new DevErrorHandler();
        }

    } catch (err) {
        return new DevErrorHandler();
    }
}

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
        AuthGuard,
        {
            provide: ErrorHandler,
            useFactory: errorHandlerServiceFactory,
            deps: []
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }