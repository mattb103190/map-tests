import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';
import { Stop } from './stop';
import { StopQueryOpts } from './stop-query-opts';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../generic/paged-response';
import { ParamSerializer } from '../generic/param-serializer';
import { SessionService } from '../session/session.service';

@Injectable()
export class StopService {
    public apiUrl = `${environment.apiBaseUrl}/stops`;
    private stopOptions: Stop[] = [];

    constructor(private sessionService: SessionService, private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer) {
        sessionService.onLogin.subscribe(() => {
            this.clearCache();
        });

        sessionService.onLogout.subscribe(() => {
            this.clearCache();
        });
    }

    clearCache() {
        this.stopOptions = [];
    }

    getOptions(flushCache: boolean): Observable<Stop[]> {
        if (flushCache) { this.clearCache(); }

        if (this.stopOptions.length > 0) {
            return Observable.of(this.stopOptions);
        }

        return this.search({ limit: 10000 })
            .map((response) => {
                this.stopOptions = response.data;
                return this.stopOptions;
            });
    }

    create(stop: Stop): Observable<Stop> {
        const url = `${this.apiUrl}`;

        const req = this.http.post(url, stop)
            .map((response) => {
                this.clearCache();
                return response.json();
            });

        return req;
    }

    getById(id: number): Observable<Stop> {
        const url = `${this.apiUrl}/${id}`;

        const req = this.http.get(url)
            .map((response) => {
                return response.json();
            });

        return req;
    }

    search(filters: StopQueryOpts): Observable<PagedResponse<Stop>> {
        const serializedParams = this.paramSerializer.serialize(filters);
        const url = `${this.apiUrl}?${serializedParams}`;

        const req = this.http.get(url)
            .map(response => {
                return {
                    data: response.json(),
                    count: parseInt(response.headers.get('X-RESULT-COUNT'), 10)
                };
            });

        return req;
    }

    update(stop: Stop): Observable<Stop> {
        const url = `${this.apiUrl}/${stop.id}`;
        const req = this.http.put(url, stop)
            .map(response => {
                this.clearCache();
                return response.json();
            });

        return req;
    }

    remove(id: number): Observable<void> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${this.sessionService.getToken()}`);

        const url = `${this.apiUrl}/${id}`;
        const req = this.http.delete(url)
            .map((response) => {
                this.clearCache();
            });

        return req;
    }
}
