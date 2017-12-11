import { Injectable } from '@angular/core';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { Observable } from 'rxjs/Observable';
import { Route } from './route';
import { RouteQueryOpts } from './route-query-opts';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../generic/paged-response';
import { ParamSerializer } from '../generic/param-serializer';

@Injectable()
export class RouteService {
    private apiUrl = `${environment.apiBaseUrl}/routing`;
    private apiActiveUrl = `${environment.apiBaseUrl}/active/routes`;
    private routeOptions: Route[] = [];

    private typeOptions = [
        { "id": 0, "code": "tram", "name": "Tram/Streetcar/Light Rail", "description": "Any light rail or street level system within a metropolitan area." },
        { "id": 1, "code": "subway", "name": "Subway/Metro", "description": "Any underground rail system within a metropolitan area." },
        { "id": 2, "code": "rail", "name": "Rail", "description": "Used for intercity or long-distance travel." },
        { "id": 3, "code": "bus", "name": "Bus", "description": "Used for short- and long-distance bus routes." },
        { "id": 4, "code": "ferry", "name": "Ferry", "description": "Used for short- and long-distance boat service." },
        { "id": 5, "code": "cable_car", "name": "Cable Car", "description": "Used for street-level cable cars where the cable runs beneath the car." },
        { "id": 6, "code": "gondola", "name": "Gondola/Suspended Cable Car", "description": "Typically used for aerial cable cars where the car is suspended from the cable." },
        { "id": 7, "code": "funicular", "name": "Funicular", "description": "Any rail system designed for steep inclines." }
    ];

    constructor(private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer) {
    }

    clearCache() {
        this.routeOptions = [];
    }

    getOptions(flushCache: boolean): Observable<Route[]> {
        if (flushCache) { this.clearCache(); }

        if (this.routeOptions.length > 0) {
            return Observable.of(this.routeOptions);
        }

        return this.search({ limit: 10000 })
            .map((response) => {
                this.routeOptions = response.data;
                return this.routeOptions;
            });
    }

    getDropdownOptions(): Observable<any> {
        return Observable.of({
            typeOptions: this.typeOptions,
        });
    }

    getById(id: number): Observable<Route> {
        const url = `${this.apiUrl}/${id}`;

        const req = this.http.get(url)
            .map((response) => {
                return response.json();
            });

        return req;
    }

    create(route: Route): Observable<Route> {
        const url = `${this.apiUrl}`;
        const req = this.http.post(url, route)
            .map((response) => response.json());

        return req;
    }

    search(filters: RouteQueryOpts): Observable<PagedResponse<Route>> {
        const mFilters = Object.assign({}, filters);

        if (mFilters['vehicle.group']) {
            delete mFilters['vehicle.group'];
        }

        const serializedParams = this.paramSerializer.serialize(mFilters);
        const url = `${this.apiUrl}?${serializedParams}`;

        const req = this.http.get(url)
            .map((response) => {
                return {
                    data: response.json(),
                    count: parseInt(response.headers.get('X-RESULT-COUNT'), 10)
                };
            });

        return req;
    }

    update(route: Route): Observable<Route> {
        const url = `${this.apiUrl}/${route.id}`;
        const req = this.http.put(url, route)
            .map(response => response.json());

        return req;
    }

    remove(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        const req = this.http.delete(url)
            .map((response) => {
                this.clearCache();
            });

        return req;
    }

    getActive(): Observable<Route[]> {
        const req = this.http.get(this.apiActiveUrl)
            .map((response) => {
                return response.json();
            });

        return req;
    }
}
