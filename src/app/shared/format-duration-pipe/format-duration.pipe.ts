import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment-duration-format';


@Pipe({ name: 'formatDuration', pure: true })
export class FormatDurationPipe implements PipeTransform {
  transform(raw: number, srcFormat: UnitOfTime, tgtFormat: string): string {
   return moment.duration(raw, <any>srcFormat)['format'](tgtFormat);
  }
}

type UnitOfTime = ('year' | 'years' | 'y' |
  'quarter' | 'quarters' | 'Q' |
  'month' | 'months' | 'M' |
  'week' | 'weeks' | 'w' |
  'date' | 'dates' | 'd' |
  'day' | 'days' |
  'hour' | 'hours' | 'h' |
  'minute' | 'minutes' | 'm' |
  'second' | 'seconds' | 's' |
  'millisecond' | 'milliseconds' | 'ms');
