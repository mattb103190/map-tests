import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';
import { Route } from './route';
import { RouteQueryOpts } from './route-query-opts';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { PagedResponse } from '../generic/paged-response';
import { ParamSerializer } from '../generic/param-serializer';

@Injectable()


export class MockScheduledVehicleService {
    data = [
        {
            'id': 1,
            'name': 'Number1',
            'speed': 50,
            'location': {
                'geometry': {
                    'type': 'Point',
                    'coordinates': [
                        -81.57051,
                        28.39281
                    ]
                }
            },
            'assigned_route': {
                'id': 1,
                'name': 'Route1',
                'long_name': 'route one',
                'color': '#0000ff',
                'text_color': '#000000',
                'type': 'bus',
                'url': null,
                'description': null
            }
        }
    ];


    constructor(private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer, private sessionService: SessionService) {
    }

    getActive(): Observable<ScheduledVehicle[]> {
        return Observable.of(this.data);
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