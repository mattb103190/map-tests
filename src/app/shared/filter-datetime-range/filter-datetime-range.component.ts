import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Directive, HostListener } from '@angular/core';
import * as moment from 'moment';
import { SubmittableFormGroup } from '../form/submittable-form-group';

@Component({
    selector: 'mtx-filter-datetime-range',
    templateUrl: './filter-datetime-range.component.html',
    styleUrls: ['./filter-datetime-range.component.css']
})
export class FilterDateTimeRangeComponent implements OnInit {

    @Input() public tgtFormGroup: SubmittableFormGroup; // tslint:disable-line:no-input-rename

    @Output() public onChange: EventEmitter<void> = new EventEmitter<void>();

    /* bindings for ui boostrap date/time pickers */
    private dateTimeFilters = {
        start_date: {
            year: moment().year(),
            month: moment().month() + 1,
            day: moment().date()
        },
        end_date: {
            year: moment().year(),
            month: moment().month() + 1,
            day: moment().date()
        },
        start_time: '00:00:00',
        end_time: '23:59:59'
    };

    /* bindings for ng2-nouislider */

    private timeRangeFilters: [number, number] = [0, 86399];
    private timeSliderConfig: any = {
        start: [0, 86399],
        step: 1,
        connect: true,
        tooltips: false,
        keyboard: true,
        pageSteps: 1,
        range: {
            min: 0,
            max: 86399
        },
        format: {
            to: function (value) {
                if (value === null || value === undefined || typeof (value) === 'string') {
                    return value;
                }

                value = Math.round(value);
                const result = moment.utc(moment.duration(value, 'seconds').asSeconds().toString(), 'X').format('HH:mm:ss');
                return result;
            },
            from: function (value) {
                const matchesFmt = /^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])$/.test(value);

                if (value === null || value === undefined || !matchesFmt) {
                    return value;
                }
                const parts = value.split(':');
                const num = (parseInt(parts[0], 10) * 60 * 60) + (parseInt(parts[1], 10) * 60) + parseInt(parts[2], 10);

                return num;
            }
        }
    };

    displayStartTime = '00:00:00';
    displayEndTime = '23:59:59';


    constructor(private el: ElementRef) { }

    ngOnInit() {
        const mStart = moment(this.tgtFormGroup.value.start_date);
        const mEnd = moment(this.tgtFormGroup.value.end_date);

        if (mStart && mStart.isValid()) {
            this.dateTimeFilters.start_date = {
                year: mStart.year(),
                month: mStart.month() + 1,
                day: mStart.date()
            };

            this.dateTimeFilters.start_time = mStart.format('HH:mm:ss');
            this.timeRangeFilters[0] = this.timeSliderConfig.format.from(mStart.format('HH:mm:ss'));
            this.timeSliderConfig.start[0] = this.timeSliderConfig.format.from(mStart.format('HH:mm:ss'));
        }

        if (mEnd && mEnd.isValid()) {
            this.dateTimeFilters.end_date = {
                year: mEnd.year(),
                month: mEnd.month() + 1,
                day: mEnd.date()
            };

            this.dateTimeFilters.end_time = mEnd.format('HH:mm:ss');
            this.timeRangeFilters[1] = this.timeSliderConfig.format.from(mEnd.format('HH:mm:ss'));
            this.timeSliderConfig.start[1] = this.timeSliderConfig.format.from(mEnd.format('HH:mm:ss'));
        }
    }

    onSliderChange(value) {
        this.tgtFormGroup.controls['start_date'].markAsDirty();
        this.tgtFormGroup.controls['end_date'].markAsDirty();

        this.dateTimeFilters.start_time = this.timeSliderConfig.format.to(value[0]);
        this.dateTimeFilters.end_time = this.timeSliderConfig.format.to(value[1]);


        this.setStartDate();
        this.setEndDate();

        this.onSlide(value);

    }

    onSlide(value) {
        this.displayStartTime = this.timeSliderConfig.format.to(value[0]);
        this.displayEndTime = this.timeSliderConfig.format.to(value[1]);
    }

    onStartTimeEntryChange(value) {
        this.tgtFormGroup.controls['start_date'].markAsDirty();
        const check = moment(value, 'HH:mm:ss');
        const matchesFmt = /^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])$/.test(value);

        if (check.isValid() && matchesFmt) {
            const secs = (check.hour() * 60 * 60) + (check.minute() * 60) + check.second();
            this.timeRangeFilters = [secs, this.timeRangeFilters[1]];

            this.setStartDate();
        } else {
            this.tgtFormGroup.controls['start_date'].setValue('');
            this.tgtFormGroup.controls['start_date'].setErrors({ invalidTime: 'invalid time' }, { emitEvent: true });
        }
    }

    onEndTimeEntryChange(value) {
        this.tgtFormGroup.controls['end_date'].markAsDirty();
        const check = moment(value, 'HH:mm:ss');
        const matchesFmt = /^([0-9]+):([0-5][0-9]):([0-5][0-9])$/.test(value);

        if (check.isValid() && matchesFmt) {
            const secs = (check.hour() * 60 * 60) + (check.minute() * 60) + check.second();
            this.timeRangeFilters = [this.timeRangeFilters[0], secs];

            this.setEndDate();
        } else {
            this.tgtFormGroup.controls['end_date'].setValue('');
            this.tgtFormGroup.controls['end_date'].setErrors({ invalidTime: 'invalid time' }, { emitEvent: true });
        }

    }

    onStartDatePickerChange(value) {
        this.tgtFormGroup.controls['start_date'].markAsDirty();

        if (!value || value === '') {
            this.tgtFormGroup.controls['start_date'].setValue('');
            this.tgtFormGroup.controls['start_date'].setErrors({ invalidDate: 'invalid date' }, { emitEvent: true });
            return;
        }

        this.setStartDate();
    }

    onEndDatePickerChange(value) {
        this.tgtFormGroup.controls['end_date'].markAsDirty();

        if (!value || value === '') {
            this.tgtFormGroup.controls['end_date'].setValue('');
            this.tgtFormGroup.controls['end_date'].setErrors({ invalidDate: 'invalid date' }, { emitEvent: true });
            return;
        }

        this.setEndDate();
    }


    setStartDate() {
        if (!this.dateTimeFilters.start_date || !this.dateTimeFilters.start_time) {
            return;
        }

        const original = this.tgtFormGroup.value['start_date'];
        const timeParts = this.timeSliderConfig.format.to(this.dateTimeFilters.start_time).split(':');

        this.tgtFormGroup.controls['start_date'].setValue(moment([this.dateTimeFilters.start_date.year,
        this.dateTimeFilters.start_date.month - 1,
        this.dateTimeFilters.start_date.day,
        timeParts[0],
        timeParts[1],
        timeParts[2]]).format('YYYY-MM-DDTHH:mm:ss'));

        if (original !== this.tgtFormGroup.value['start_date']) {
            this.onChange.next();
        }
    }

    setEndDate() {
        if (!this.dateTimeFilters.end_date || !this.dateTimeFilters.end_time) {
            return;
        }

        const original = this.tgtFormGroup.value['end_date'];
        const timeParts = this.timeSliderConfig.format.to(this.dateTimeFilters.end_time).split(':');

        this.tgtFormGroup.controls['end_date'].setValue(moment([this.dateTimeFilters.end_date.year,
        this.dateTimeFilters.end_date.month - 1,
        this.dateTimeFilters.end_date.day,
        timeParts[0],
        timeParts[1],
        timeParts[2]]).format('YYYY-MM-DDTHH:mm:ss'));

        if (original !== this.tgtFormGroup.value['end_date']) {
            this.onChange.next();
        }
    }
}
