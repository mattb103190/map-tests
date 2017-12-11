import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { PagedResponse } from '../generic/paged-response';

@Injectable()
export class StopEtaService {
    private apiUrlTpl = `${environment.apiBaseUrl}/stops/:id/etas`;

    constructor(private sessionService: SessionService, private http: AuthenticatedHttpClient) {
    }

    get(id: number): Observable<PagedResponse<StopEta>> {
        const req = this.http.get(this.apiUrlTpl.replace(':id', id.toString()))
            .map((response) => {
                return {
                    data: response.json(),
                    count: parseInt(response.headers.get('X-RESULT-COUNT'), 10)
                };
            });

        return req;
    }
}

export class StopEta {
    id: number;
    name: string;
    color: string;
    vehicles: [{
        id: number;
        name: string;
        eta: string;
    }];
}
