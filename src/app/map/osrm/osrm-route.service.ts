import { Injectable, Inject } from '@angular/core';
import { Http, URLSearchParams, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

export class OsrmRouteService {
    private apiUrl = 'https://osrm.mototrax.angeltrax.com/route/v1'

    constructor(@Inject(Http) private http: Http) { }

    // coords should be [[lng, lat], [lng,lat], etc]
    public search(profile = 'driving', coords: [[number, number]],  params?: RouteParams): Observable<any> {

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const queryParams = new URLSearchParams();

        if (params) {
            queryParams.append('alernatives', params.alternatives ? params.alternatives.toString() : undefined);
            queryParams.append('steps', params.steps ? params.steps.toString() : undefined);
            queryParams.append('annotations', params.annotations ? params.annotations.toString() : undefined);
            queryParams.append('geometries', params.geometries ? params.geometries.toString() : undefined);
            queryParams.append('overview', params.overview ? params.overview.toString() : undefined);
            queryParams.append('continue_straight', params.continue_straight ? params.continue_straight.toString() : undefined);
        }

        const coordinates = coords.map(latLng => `${latLng[0]},${latLng[1]}`).join(';');

        const reqUrl = `${this.apiUrl}/${profile}/${coordinates}`;

        return this.http.get(reqUrl, { params: queryParams }).map(response => response.json());
    }
}

class RouteParams {
    alternatives?: boolean | number = false
    steps?= false
    annotations?: boolean | 'nodes' | 'distance' | 'duration' | 'datasources' | 'weight' | 'speed' = false
    geometries?: 'polyline' | 'polyline6' | 'geojson' = 'polyline'
    overview?: 'simplified' | 'full' | false
    continue_straight?: 'default' | boolean = 'default'
}