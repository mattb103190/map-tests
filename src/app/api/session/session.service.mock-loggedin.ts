import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../../environments/environment';
import { Session } from './session';
import { Credentials } from './credentials';

@Injectable()
export class MockLoggedInSessionService {

    public static STORAGE_KEYS = { TOKEN: 'token' };
    public onLogin: EventEmitter<void> = new EventEmitter<void>();
    public onLogout: EventEmitter<void> = new EventEmitter<void>();

    private sessionUrl: string;
    private currentSession: Session;

    constructor(private http: Http, private localStorageService: LocalStorageService) {
        this.sessionUrl = `${environment.apiBaseUrl}/sessions`;
        this.localStorageService.store(MockLoggedInSessionService.STORAGE_KEYS.TOKEN, 'FAKETOKEN');
        this.loadStoredSession();
    }

    private loadStoredSession() {
        const existingToken = this.localStorageService.retrieve(MockLoggedInSessionService.STORAGE_KEYS.TOKEN);

        if (existingToken) {
            this.currentSession = {
                token: existingToken
            };

            this.onLogin.emit();
        }
    }

    getOneTimeToken(): Observable<Session> {
        return Observable.of({ token: 'ONE_TIME_TOKEN'});
    }

    getToken() {
        return 'FAKETOKEN';
    }

    isAuthenticated() {
        return true;
    }

    logout() {
        this.currentSession = null;
        this.localStorageService.clear(MockLoggedInSessionService.STORAGE_KEYS.TOKEN);
        this.onLogout.emit();
    }

    login(credentials: Credentials): Observable<Session> {
        this.localStorageService.store(MockLoggedInSessionService.STORAGE_KEYS.TOKEN, 'FAKETOKEN');

        // http://stackoverflow.com/questions/13292744/why-isnt-localstorage-persisting-in-chrome
        this.loadStoredSession();

        this.onLogin.emit();
        return Observable.of({ token: 'FAKETOKEN' });
    }
}
