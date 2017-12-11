import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'mtx-validity-indicator',
    template:
    `<span class="validation-icon"  style=""
        *ngIf="(!showErrorsOnly && (submitted || control.dirty)) || (showErrorsOnly && (submitted || control.dirty) && control.errors)">
        <ng-template #tipContent>
            <span *ngIf="control.hasError('required')">Required</span>
            <span *ngIf="control.hasError('minlength')">At least {{ control.errors.minlength.requiredLength }} characters required.</span>
            <span *ngIf="control.hasError('max length')">Cannot exceed {{ control.errors.maxlength.requiredLength }} characters.</span>
            <span *ngIf="control.hasError('pattern')">Does not meet required format.<span *ngIf="example">
            Example: {{ example }}
            </span></span>
            <span *ngIf="control.hasError('invalidDate')">Invalid Date.<span *ngIf="example"> Example: {{ example }}</span></span>
            <span *ngIf="control.hasError('invalidTime')">Invalid Time.<span *ngIf="example"> Example: {{ example }}</span></span>
        </ng-template>
        <span style="" *ngIf="control.invalid" #t="ngbTooltip" [ngbTooltip]="tipContent">
            <img style="height: 10px; width: 10px" src="/assets/images/icons/x.png" alt="valid" />
        </span>
        <span style="" *ngIf="control.valid">
            <img style="height: 10px; width: 10px" src="/assets/images/icons/check.png" alt="valid" />
        </span>
    </span>`
})
export class ValidityIndicatorComponent {
    @Input() submitted;
    @Input() control: FormControl;
    @Input() example: string;
    @Input() showErrorsOnly = false;
}
