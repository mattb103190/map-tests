import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Organization } from './organization';
import { OrganizationQueryOpts } from './organization-query-opts';
import { environment } from '../../../environments/environment';
import * as moment from 'moment-timezone';
import { AuthenticatedHttpClient } from '../auth-http-client.service';
import { IReferenceType } from '../generic/reference-type';
import { SessionService } from '../session/session.service';
import { ParamSerializer } from '../generic/param-serializer';
import { PagedResponse } from '../generic/paged-response';


@Injectable()
export class OrganizationService {

    private apiUrl = `${environment.apiBaseUrl}/organizations`;

    private currentOrg: Organization = null;

    private types: IReferenceType[] = [
        { id: 'other', name: 'Other', description: '' },
        { id: 'police', name: 'Police', description: '' }
    ];

    private publicRouteOptions: IReferenceType[] = [
        { name: 'Yes', id: 'true', description: '' },
        { name: 'No', id: 'false', description: '' }
    ];

    constructor(private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer, private sessionService: SessionService) {

        sessionService.onLogin.subscribe(() => {
            this.clearCache();
        });

        sessionService.onLogout.subscribe(() => {
            this.clearCache();
        });
    }

    clearCache() {
        this.currentOrg = null;
    }

    getTimezones() {
        return Observable.of(moment.tz.names());
    }

    getTypes() {
        return Observable.of(this.types);
    }

    getPublicRouteOptions() {
        return Observable.of(this.publicRouteOptions);
    }

    create(organization: Organization): Observable<Organization> {
        const url = `${this.apiUrl}`;

        const req = this.http.post(url, organization).map(response => {
            return response.json();
        });

        return req;
    }

    search(filters: OrganizationQueryOpts): Observable<PagedResponse<Organization>> {
        const serializedParams = this.paramSerializer.serialize(filters);
        const url = `${this.apiUrl}?${serializedParams}`;

        const req = this.http.get(url).map((response) => {
            return {
                data: response.json(),
                count: parseInt(response.headers.get('X-RESULT-COUNT'), 10)
            };
        });

        return req;
    }

    getById(id: number): Observable<Organization> {
        const url = `${this.apiUrl}/${id}`;

        const req = this.http.get(url).map(response => response.json());

        return req;
    }

    getCurrentOrganization(): Observable<Organization> {
        if (this.currentOrg !== null) {
            return Observable.of(this.currentOrg);
        }

        const url = `${this.apiUrl}/me`;

        const req = this.http.get(url).map(res => {
            this.clearCache();
            this.currentOrg = res.json();
            return this.currentOrg;
        });

        return req;
    }

    update(organization: Organization): Observable<Organization> {
        const url = `${this.apiUrl}/${organization.id}`;
        const req = this.http.put(url, organization).map(response => {
            return response.json();
        });

        return req;
    }

    updateCurrentOrganization(organization: Organization): Observable<Organization> {
        const url = `${this.apiUrl}/me`;
        const req = this.http.put(url, organization).map(response => {
            return response.json();
        });

        return req;
    }

    remove(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        const req = this.http.delete(url).map(response => {
            return null;
        });

        return req;
    }
}
