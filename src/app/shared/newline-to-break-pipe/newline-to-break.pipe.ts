import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment-duration-format';


@Pipe({ name: 'newLineToBreak', pure: true })
export class NewLineToBreakPipe implements PipeTransform {
    transform(raw: string): string {
        return raw.replace('\n', '<br>');
    }
}
