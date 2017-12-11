import { NgModule, SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertDisplayComponent } from './alert/alert-display.component';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypePipe } from './alert/alert-type.pipe';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ValidationMessagesComponent } from './validation-message/validation-message.component';
import { LoggerService } from './logging/logger.service';
import { ClosePopoverOnClickOutsideDirective } from './close-popover-on-click-outside/close-popover-on-click-outside.directive';
import { NouisliderModule } from 'ng2-nouislider';
import { FormatDurationPipe } from './format-duration-pipe/format-duration.pipe';
import { ValidityIndicatorComponent } from './validity-indicator/validity-indicator.component';
import { ToFixedPipe } from './to-fixed-pipe/to-fixed.pipe';
import { NewLineToBreakPipe } from './newline-to-break-pipe/newline-to-break.pipe';
import { FilterDateTimeRangeComponent } from './filter-datetime-range/filter-datetime-range.component';

@NgModule({
    declarations: [
        AlertDisplayComponent,
        AlertTypePipe,
        LoadingDialogComponent,
        ConfirmationModalComponent,
        ValidationMessagesComponent,
        ClosePopoverOnClickOutsideDirective,
        FormatDurationPipe,
        ValidityIndicatorComponent,
        ToFixedPipe,
        FilterDateTimeRangeComponent,
        NewLineToBreakPipe
    ],
    imports: [CommonModule, NgbModule, RouterModule, ReactiveFormsModule, FormsModule, NouisliderModule],
    exports: [
        AlertDisplayComponent,
        LoadingDialogComponent,
        ConfirmationModalComponent,
        ValidationMessagesComponent,
        ClosePopoverOnClickOutsideDirective,
        FormatDurationPipe,
        ValidityIndicatorComponent,
        ToFixedPipe,
        FilterDateTimeRangeComponent,
        NewLineToBreakPipe
    ],
    providers: [LoggerService, NgbActiveModal],
    entryComponents: [
        ConfirmationModalComponent
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: SharedModule) {}
}
