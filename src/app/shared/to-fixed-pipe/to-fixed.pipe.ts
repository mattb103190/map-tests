import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'toFixed' })
export class ToFixedPipe implements PipeTransform {
    transform(raw: any, precision: number): string {
        if (raw === null || raw === undefined) {
            return null;
        } else {
            const fixedValue = raw.toFixed(precision);
            return fixedValue;
        }
    }
}
