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
    private apiUrl = `${environment.apiBaseUrl}/gtfs/stops`;
    private stopOptions: Stop[] = [];
    private data =[{"id":1,"name":"Org1_stop1","code":"o1-one","description":"org1 first stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.4321765899658,31.2284724615694]},"boundary":{"type":"Polygon","coordinates":[[[-85.4324126243591,31.2282339294713],[-85.4318976402283,31.2282339294713],[-85.4318976402283,31.2288486071163],[-85.4324126243591,31.2288486071163],[-85.4324126243591,31.2282339294713]]]}},{"id":2,"name":"Org1_stop2","code":"o1-two","description":"org1 second stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.4247093200683,31.2490940369638]},"boundary":{"type":"Polygon","coordinates":[[[-85.4248702526092,31.2489472800928],[-85.4245215654373,31.2489472800928],[-85.4245215654373,31.2493416886665],[-85.4248702526092,31.2493416886665],[-85.4248702526092,31.2489472800928]]]}},{"id":3,"name":"Org1_stop3","code":"o1-three","description":"org1 third stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.3653144836426,31.2384902659765]},"boundary":{"type":"Polygon","coordinates":[[[-85.3657865524292,31.23819671905],[-85.3647565841675,31.23819671905],[-85.3647565841675,31.2392791688215],[-85.3657865524292,31.2392791688215],[-85.3657865524292,31.23819671905]]]}},{"id":4,"name":"Org1_stop4","code":"o1-four","description":"org1 fourth stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.375657081604,31.1948151392379]},"boundary":{"type":"Polygon","coordinates":[[[-85.3758180141449,31.1946820644399],[-85.3754585981369,31.1946820644399],[-85.3754585981369,31.1951088208886],[-85.3758180141449,31.1951088208886],[-85.3758180141449,31.1946820644399]]]}},{"id":5,"name":"Org1_stop5","code":"o1-five","description":"org1 fifth stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.4132509231567,31.1975316597273]},"boundary":{"type":"Polygon","coordinates":[[[-85.4135513305664,31.1972746949127],[-85.4128754138947,31.1972746949127],[-85.4128754138947,31.1979721692144],[-85.4135513305664,31.1979721692144],[-85.4135513305664,31.1972746949127]]]}},{"id":16,"name":"Org1_stop6","code":"o1-six","description":"org1 sixth stop","url":null,"location_type":"stop","has_wheelchair_boarding":null,"geometry":{"type":"Point","coordinates":[-85.4132509231567,31.1975316597273]},"boundary":{"type":"Polygon","coordinates":[[[-85.4135513305664,31.1972746949127],[-85.4128754138947,31.1972746949127],[-85.4128754138947,31.1979721692144],[-85.4135513305664,31.1979721692144],[-85.4135513305664,31.1972746949127]]]}}];

    constructor(private http: AuthenticatedHttpClient, private paramSerializer: ParamSerializer, private sessionService: SessionService) {
    }

    clearCache() {
        this.stopOptions = [];
    }

    getOptions(flushCache: boolean): Observable<Stop[]> {
        if (flushCache) { this.clearCache(); }

        this.stopOptions = this.data;
        return Observable.of(this.stopOptions);
    }

    search(filters: StopQueryOpts): Observable<PagedResponse<Stop>> {
        return Observable.of({
            data: this.data,
            count: this.data.length
        });
    }

    create(stop: Stop): Observable<Stop> {
        return Observable.of(this.data[0]);
    }

    update(stop: Stop): Observable<Stop> {
        this.clearCache();
        for (let i = 0; i < this.data.length; i++) {
            if (stop.id === this.data[i].id) {
                return Observable.of(this.data[i]);
            }
        }
    }

    getById(id: number): Observable<Stop> {
        for (let i = 0; i < this.data.length; i++) {
            if (id === this.data[i].id) {
                return Observable.of(this.data[i]);
            }
        }
    }

    remove(id: number): Observable<void> {
        this.clearCache();
        return Observable.of(null);
    }
}
