import { NgModule, SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { Ng2Webstorage } from 'ngx-webstorage';
import { SessionService } from './session/session.service';
import { AuthenticatedHttpClient } from './auth-http-client.service';
import { MockLoggedInSessionService } from './session/session.service.mock-loggedin';
import { StopService } from './stops/stop.service';
import { RouteService } from './routes/route.service';
import { StopEtaService } from './routes/stop-eta.service';
import { ScheduledVehicleService } from './routes/scheduled-vehicle.service';
import { MockStopEtaService } from './routes/stop-eta.service.mock';
import { MockScheduledVehicleService } from './routes/scheduled-vehicle.service.mock';
import { MockRouteService } from './routes/route.service.mock';
import { MockStopService } from './stops/stop.service.mock';
import { OrganizationService } from './organization/organization.service';
import { MockOrganizationService } from './organization/organization.service.mock';
import { ParamSerializer } from './generic/param-serializer';

@NgModule({
    declarations: [],
    imports: [CommonModule, HttpModule, Ng2Webstorage],
    exports: [],
    providers: [
        AuthenticatedHttpClient,
        SessionService,
        ScheduledVehicleService,
        StopEtaService,
        ParamSerializer,
        RouteService,
        StopService,
        OrganizationService
    ],
})
export class ApiModule {
    static forRoot(useMocks: boolean = false): ModuleWithProviders {
        if (useMocks) {
            return {
                ngModule: ApiModule,
                providers: [
                    { provide: SessionService, useClass: MockLoggedInSessionService },
                    { provide: ScheduledVehicleService, useClass: MockScheduledVehicleService },
                    { provide: StopEtaService, useClass: MockStopEtaService },
                    { provide: OrganizationService, useClass: MockOrganizationService },
                    { provide: RouteService, useClass: MockRouteService },
                    { provide: StopService, useClass: MockStopService }
                ]
            };
        }

        return {
            ngModule: ApiModule,
            providers: []
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule) {
        if (parentModule) {
            throw new Error(
                'ApiModule is already loaded. Import it in the AppModule only');
        }
    }
}
