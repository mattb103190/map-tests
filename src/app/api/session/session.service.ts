import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../../environments/environment';
import { Session } from './session';
import { Credentials } from './credentials';

@Injectable()
export class SessionService {

    public static STORAGE_KEYS = { TOKEN: 'token' };
    public onLogin: EventEmitter<void> = new EventEmitter<void>();
    public onLogout: EventEmitter<void> = new EventEmitter<void>();

    private sessionUrl: string;
    private currentSession: Session;

    constructor(private http: Http, private localStorageService: LocalStorageService) {
        this.sessionUrl = `${environment.apiBaseUrl}/sessions`;
        this.loadStoredSession();
    }

    private loadStoredSession() {
        const existingToken = this.localStorageService.retrieve(SessionService.STORAGE_KEYS.TOKEN);

        if (existingToken) {
            this.currentSession = {
                token: existingToken
            };

            this.onLogin.emit();
        }
    }

    getOneTimeToken(): Observable<Session> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${this.currentSession.token}`);

        const req = this.http.get(`${this.sessionUrl}/onetimetoken`, {
            headers: headers
        }).map((response) => response.json().token);

        return req;
    }

    getToken() {
        return this.currentSession ? this.currentSession.token : null;
    }

    isAuthenticated() {
        return this.currentSession && this.currentSession.token ? true : false;
    }

    logout() {
        this.currentSession = null;
        this.localStorageService.clear(SessionService.STORAGE_KEYS.TOKEN);
        this.onLogout.emit();
    }

    login(credentials: Credentials): Observable<Session> {
        if (this.currentSession) {
            throw new Error('already logged in');
        }

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const req = this.http.post(this.sessionUrl, credentials, { headers: headers })
            .map((res) => {
                const data = res.json();
                this.localStorageService.store(SessionService.STORAGE_KEYS.TOKEN, data.token);

                // http://stackoverflow.com/questions/13292744/why-isnt-localstorage-persisting-in-chrome
                this.loadStoredSession();

                this.onLogin.emit();
                return data;
            });

        return req;
    }
}
