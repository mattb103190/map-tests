import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../../environments/environment';
import { Session } from './session';
import { Credentials } from './credentials';

@Injectable()
export class MockLoggedOutSessionService {

    public static STORAGE_KEYS = { TOKEN: 'token' };
    public onLogin: EventEmitter<void> = new EventEmitter<void>();
    public onLogout: EventEmitter<void> = new EventEmitter<void>();

    private sessionUrl: string;
    private currentSession: Session;

    constructor(private http: Http, private localStorageService: LocalStorageService) {
        this.sessionUrl = `${environment.apiBaseUrl}/sessions`;
        this.localStorageService.clear();
    }

    private loadStoredSession() {
        this.currentSession = null;
    }

    getOneTimeToken(): Observable<Session> {
        return Observable.of(null);
    }

    getToken() {
        return null;
    }

    isAuthenticated() {
        return false;
    }

    logout() {
        this.currentSession = null;
        this.localStorageService.clear(MockLoggedOutSessionService.STORAGE_KEYS.TOKEN);
        this.onLogout.emit();
    }

    login(credentials: Credentials): Observable<Session> {
        this.localStorageService.store(MockLoggedOutSessionService.STORAGE_KEYS.TOKEN, 'FAKETOKEN');

        // http://stackoverflow.com/questions/13292744/why-isnt-localstorage-persisting-in-chrome
        this.loadStoredSession();

        this.onLogin.emit();
        return Observable.of({ token: 'FAKETOKEN' });
    }
}
