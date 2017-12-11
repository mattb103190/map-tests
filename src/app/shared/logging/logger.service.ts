import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Response } from '@angular/http';
import { AlertMessage } from '../index';


@Injectable()
export class LoggerService {

    public logError(err: Error) {
        // if (window.Raven) {
        //     window.Raven.captureException(err);
        // }
    }

    public apiErrorsToDisplayErrors(err: Response | any) {
        const results: AlertMessage[] = [];

        if (!err) {
            results.push({ type: 'danger', msg: 'An unknown error occurred. Please try again.' });
        }

        if (err instanceof Response) {
            if (err.status === 500) {
                results.push({ type: 'danger', msg: 'An error occurred. Please try again.' });
            } else if (err.status === 400) {
                const messages = err.json();
                if (messages) {
                    for (let i = 0; i < messages.length; i++) {
                        results.push({ type: 'danger', msg: messages[i] });
                    }
                }
            } else if (err.status === 403) {
                results.push({ type: 'danger', msg: 'You are not allowed to perform that action.' });
            } else if (err.status === 401) {
                results.push({ type: 'danger', msg: 'Login has expired. Please log back in.' });
            } else {
                results.push({ type: 'danger', msg: `Invalid response received [${err.status}]. Please try again.` });
            }
        } else {
            const msg = err ? err.message ? err.message : err.toString() : 'missing error object';
            results.push({ type: 'danger', msg: msg });
        }

        return results;
    }

    cleanName(s) {
        let name = s[0].toUpperCase() + s.slice(1);
        name = name.replace('_', ' ');
        return name;
    }

    public mapFormControlToErrors(fc: FormControl) {

    }

    public mapFormGroupToErrors(fg: FormGroup) {
        let messages = [];

        for (const key in fg.controls) {

            if (fg.controls[key]) {
                const upperKey = this.renameField(this.cleanName(key));
                if (fg.controls[key] instanceof FormGroup) {
                    const msgs2 = this.mapFormGroupToErrors(<FormGroup>fg.controls[key]);
                    messages = messages.concat(msgs2);
                } else if (fg.controls[key].hasError('required')) {
                    messages.push({ type: 'danger', msg: `${upperKey} is required.` });
                } else if (fg.controls[key].hasError('match')) {
                    messages.push({ type: 'danger', msg: `Passwords must match` });
                } else if (fg.controls[key].hasError('invalid date')) {
                    messages.push({ type: 'danger', msg: `${upperKey} is invalid.` });
                } else if (fg.controls[key].hasError('pattern')) {
                    messages.push({ type: 'danger', msg: `${upperKey} does not meet the required format.` });
                } else if (fg.controls[key].hasError('minlength')) {
                    const minLength = fg.controls[key].errors['minlength'].requiredLength;

                    if (Array.isArray(fg.controls[key].value)) {
                        messages.push({ type: 'danger', msg: `${upperKey} selection must contain at least ${minLength} items.` });
                    } else {
                        messages.push({ type: 'danger', msg: `${upperKey} must have at least ${minLength} characters.` });
                    }
                } else if (fg.controls[key].hasError('maxlength') || fg.controls[key].hasError('maxlength')) {
                    const maxLength = fg.controls[key].errors['maxlength'].requiredLength;

                    if (Array.isArray(fg.controls[key].value)) {
                        messages.push({ type: 'danger', msg: `${upperKey} selection cannot contain more than ${maxLength} items.` });
                    } else {
                        messages.push({ type: 'danger', msg: `${upperKey} cannot exceed ${maxLength} characters.` });
                    }
                } else if (fg.controls[key].invalid) {
                    messages.push({ type: 'danger', msg: `${upperKey} contains an invalid value` });
                }
            }
        }
        return messages;
    }

    renameField(name) {
        switch (name) {
            case 'Organization':
                return 'Account';
            case 'Vehicle.id':
                return 'Vehicle';
            case 'Vehicle.group.id':
                return 'Group';
            case 'Route.id':
                return 'Route';
            default:
                return name;
        }
    }
}
