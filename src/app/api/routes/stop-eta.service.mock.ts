import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { PagedResponse } from '../generic/paged-response';

@Injectable()
export class MockStopEtaService {
    data = [
        {
            'id': 1,
            'name': 'Route1',
            'long_name': 'route one',
            'color': '#0000ff',
            'text_color': '#000000',
            'vehicles': [
                {
                    'id': 1,
                    'name': 'Number1',
                    'eta': '2017-06-13T18:52:04-04:00'
                }
            ]
        }
    ];

    constructor(private sessionService: SessionService, private http: AuthenticatedHttpClient) {
    }

    get(id: number): Observable<PagedResponse<StopEta>> {
        return Observable.of({
            data: this.data,
            count: this.data.length
        });
    }
}

export class StopEta {
    id: number;
    name: string;
    long_name? : string;
    color: string;
    text_color?: string;
    vehicles: {
        id: number;
        name: string;
        eta: string;
    }[];
}
