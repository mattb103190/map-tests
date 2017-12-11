import { Component, Input } from '@angular/core';

import { AlertMessage } from './alert-message';

@Component({
    selector: 'mtx-alert-display',
    template: `
        <ngb-alert [type]="'danger'" [dismissible]="false" *ngIf="countByType('danger') > 0">
            <ul>
                <li *ngFor="let alert of alerts | alertType:'danger'">{{ alert.msg }}</li>
            </ul>
        </ngb-alert>

        <ngb-alert [type]="'success'" [dismissible]="false" *ngIf="countByType('success') > 0">
            <ul>
                <li *ngFor="let alert of alerts | alertType:'success'">{{ alert.msg }}</li>
            </ul>
        </ngb-alert>
    `,
    styles: [
        ':host >>> .alert, .alert-danger { border-radius: 0px; }',
        ':host >>> .alert ul { padding-bottom: 0px; margin-bottom: 0px; }'
    ]
})
export class AlertDisplayComponent {

    @Input() alerts: AlertMessage[];

    constructor() { }

    public closeAlert(alert: AlertMessage) {
        const index: number = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    }

    public countByType(type) {
        let count = 0;
        for (let i = this.alerts.length - 1; i >= 0; i--) {
            if (this.alerts[i].type === type) {
                count++;
            }
        }

        return count;
    }
}

