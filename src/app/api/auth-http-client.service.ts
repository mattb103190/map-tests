import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { SessionService } from './session/session.service';

@Injectable()
export class AuthenticatedHttpClient {

    constructor(private http: Http, private sessionService: SessionService) { }

    buildDefaultHeaders() {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        if (this.sessionService.isAuthenticated()) {
            headers.append('Authorization', `Bearer ${this.sessionService.getToken()}`);
            headers.append('Cache-Control', 'no-cache');
            headers.append('Pragma', 'no-cache');
            headers.append('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        }

        return headers;
    }

    get(url) {
        const headers = this.buildDefaultHeaders();
        return this.http.get(url, {
            headers: headers
        });
    }

    delete(url) {
        const headers = this.buildDefaultHeaders();
        return this.http.delete(url, {
            headers: headers
        });
    }

    post(url, data) {
        const headers = this.buildDefaultHeaders();
        return this.http.post(url, data, {
            headers: headers
        });
    }

    put(url, data) {
        const headers = this.buildDefaultHeaders();
        return this.http.put(url, data, {
            headers: headers
        });
    }
}
