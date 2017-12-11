import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import * as GoogleMapsApiLoader from 'google-maps-api-loader';
declare var window: any;

@Injectable()
export class GoogleMapsApiLoaderService {

    private isInitialized = false;
    private gMapsApi: any;
    private loader: GoogleMapsApiLoader;

    constructor() {
        console.warn('CREATING INSTANCE OF GoogleMapsApiLoaderService');
        if (window['google']) {
            this.gMapsApi = window['google'];
            this.isInitialized = true;
            return;
        }

        this.loader = GoogleMapsApiLoader({
            libraries: ['places'],
            apiKey: 'AIzaSyAKPEbmAod-EdEGvwvZyyoVjuvxajED9mE'
        }).then(goog => {
            this.gMapsApi = goog;
            this.isInitialized = true;
        });
    }

    onMapReady() {
        if (this.isInitialized) {
            return Promise.resolve(this.gMapsApi);
        } else {
            return this.loader;
        }
    }

}
