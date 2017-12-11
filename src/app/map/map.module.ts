import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsApiLoaderService } from './google-maps-api-loader/google-maps-api-loader.service';
import { BaseMapComponent } from './base-map/base-map.component';
import { DrawingMapComponent } from './drawing-map/drawing-map.component';
import { OsrmRouteService } from './osrm/osrm-route.service';

@NgModule({
    declarations: [BaseMapComponent, DrawingMapComponent],
    imports: [CommonModule],
    exports: [BaseMapComponent, DrawingMapComponent],
    providers: [
        GoogleMapsApiLoaderService,
        OsrmRouteService
    ],
})
export class MapModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: []
        };
    }
}
