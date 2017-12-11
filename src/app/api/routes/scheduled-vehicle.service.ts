import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';
import { Route } from './route';
import { RouteQueryOpts } from './route-query-opts';

import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { PagedResponse } from '../generic/paged-response';
import { ParamSerializer } from '../generic/param-serializer';

@Injectable()
export class ScheduledVehicleService {
    private apiUrl = `${environment.apiBaseUrl}/active/vehicles`;

    constructor(private sessionService: SessionService, private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer) {
    }

    getActive(): Observable<ScheduledVehicle[]> {
        const req = this.http.get(this.apiUrl)
            .map((response) => {
                return response.json();
            });

        return req;
    }
}

export class ScheduledVehicle {
    id: number;
    name: string;
    speed: number;
    location: {
        geometry: {
            type: string;
            coordinates: number[]
        }
    };
    assigned_route: {
        id: number;
        name: string;
        color: string;
        text_color: string;
    };
}
