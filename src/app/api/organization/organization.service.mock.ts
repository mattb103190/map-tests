import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { Organization } from './organization';
import { OrganizationQueryOpts } from './organization-query-opts';
import { IReferenceType } from '../generic/reference-type';
import { PagedResponse } from '../generic/paged-response';


@Injectable()
export class MockOrganizationService {

    private currentOrg: Organization = null;

    private types: IReferenceType[] = [
        { id: 'other', name: 'Other', description: '' },
        { id: 'police', name: 'Police', description: '' }
    ];

    private publicRouteOptions: IReferenceType[] = [
        { name: 'Yes', id: 'true', description: '' },
        { name: 'No', id: 'false', description: '' }
    ];

    data = [
        {
            'id': 1,
            'name': 'Alexandria',
            'display_name': 'Alexandria Colony',
            'contact': {
                'name': 'Rick Grimes',
                'phone': '334-692-4600',
                'addr1': 'IVS. INC',
                'addr2': '9540 US HWY 84 W',
                'city': 'Newton',
                'state': 'Alabama',
                'zip': '36369'
            },
            'time_zone': 'US/Eastern',
            'apikey': '8e834703-6031-414e-a288-7191',
            'type': 'other',
            'has_public_routes': true,
            'user': {
                'id': 1,
                'name': 'rick.grimes',
                'email': 'rick.grimes@angeltrax.com'
            }
        }
    ];

    constructor() {

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
        return Observable.of(this.data[0]);

    }

    search(filters: OrganizationQueryOpts): Observable<PagedResponse<Organization>> {
        return Observable.of({
            data: this.data,
            count: this.data.length
        });
    }

    getById(id: number): Observable<Organization> {
        return Observable.of(this.data[0]);
    }

    getCurrentOrganization(): Observable<Organization> {
        return Observable.of(this.data[0]);
    }

    update(organization: Organization): Observable<Organization> {
        return Observable.of(this.data[0]);
    }

    updateCurrentOrganization(organization: Organization): Observable<Organization> {
        for (let i = 0; i < this.data.length; i++) {
            if (organization.id === this.data[i].id) {
                return Observable.of(this.data[i]);
            }
        }
    }

    remove(id: number): Observable<void> {
        this.clearCache();
        return Observable.of(null);
    }
}
