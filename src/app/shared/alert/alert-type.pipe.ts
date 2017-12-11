import {Pipe, PipeTransform } from '@angular/core';
import { AlertMessage } from './alert-message';

@Pipe({ name: 'alertType'})
export class AlertTypePipe implements PipeTransform {
  transform(allAlerts: AlertMessage[], msgType: string): AlertMessage[] {
    return allAlerts.filter(alert => alert.type === msgType);
  }
}
