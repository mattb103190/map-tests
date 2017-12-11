import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'mtx-validation-messages',
    template:
    `<span *ngIf=" ( control.touched || submitted) && control.errors">
        <div class="form-control-feedback" *ngIf="control.hasError('required')">Required</div>
        <div class="form-control-feedback" *ngIf="control.hasError('minlength')">At least {{ control.errors.minlength.requiredLength }} characters required.</div>
        <div class="form-control-feedback" *ngIf="control.hasError('max length')">Cannot exceed {{ control.errors.maxlength.requiredLength }} characters.</div>
        <div class="form-control-feedback" *ngIf="control.hasError('pattern')">Does not meet required format.<span *ngIf="example"> Example: {{ example }}</span></div>
        <div class="form-control-feedback" *ngIf="control.hasError('invalidDate')">Invalid Date.<span *ngIf="example"> Example: {{ example }}</span></div>
        <div class="form-control-feedback" *ngIf="control.hasError('invalidTime')">Invalid Time.<span *ngIf="example"> Example: {{ example }}</span></div>
    </span>`,
    styles: [`
        .form-control-feedback {
            font-size: 10px;
            color: #bb0000;
        }`]
})
export class ValidationMessagesComponent {
    @Input() submitted: boolean;
    @Input() control: FormControl;
    @Input() example: string;
    @Input() showErrorsOnly = false;
}


/* VALIDATION */

