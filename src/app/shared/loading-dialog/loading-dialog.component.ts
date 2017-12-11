import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'mtx-loading-dialog',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['./loading-dialog.component.css']
})
export class LoadingDialogComponent {
    @Input() watch: Promise<any>|Observable<any>;
}

