import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { Ng2CompleterModule } from "ng2-completer";
import { ColorPickerModule } from 'ngx-color-picker';

import { SharedModule } from '../../shared/shared.module';
import { ApiModule } from '../../api/index';
import { MapModule } from '../../map/map.module';
import { RoutingRoutingModule } from './routing-routing.module';

import { RoutesManagerComponent } from './routes/routes-manager/routes-manager.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MapModule,
        NgbModule,
        NgbModalModule,
        NgbCollapseModule,
        FileUploadModule,        
        SharedModule,
        Ng2CompleterModule,
        ColorPickerModule,
        RoutingRoutingModule
    ],
    providers: [],
    declarations: [
        RoutesManagerComponent
    ],
    entryComponents: [
    ]
    // bootstrap: [AppComponent]
})
export class RoutingModule {
}
