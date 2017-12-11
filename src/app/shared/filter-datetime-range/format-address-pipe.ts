import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'formatAddress', pure: true })
export class FormatAddressPipe implements PipeTransform {
    transform(raw: any, format: string): string {

        if (!format || format === 'text') {
            if (raw && raw.address && raw.address.country_code) {

                let line1 = (raw.address.road_number ? raw.address.road_number + ' ' : '');
                line1 += (raw.address.road ? raw.address.road : '');

                let line2 = (raw.address.city ? raw.address.city : (raw.address.county ? raw.address.county : ''));
                line2 += raw.address.state ? (line2 !== '' ? ', ' + raw.address.state : raw.address.state) : '';

                line2 += raw.address.zip ? (line2 !== '' ? ' ' + raw.address.zip : raw.address.zip) : '';

                return `${line1} ${line2}`;
            } else if (raw && raw.geometry && raw.geometry.coordinates[0] !== 0 && raw.geometry.coordinates[1] !== 0) {
                return `${raw.geometry.coordinates[1]}, ${raw.geometry.coordinates[0]}`;
            } else {
                return 'NO GPS';
            }
        } else if (format === 'html') {
             if (raw && raw.address && raw.address.country_code) {

                let line1 = (raw.address.road_number ? raw.address.road_number + ' ' : '');
                line1 += (raw.address.road ? raw.address.road : '');

                let line2 = (raw.address.city ? raw.address.city : (raw.address.county ? raw.address.county : ''));
                line2 += raw.address.state ? (line2 !== '' ? ', ' + raw.address.state : raw.address.state) : '';

                line2 += raw.address.zip ? (line2 !== '' ? ' ' + raw.address.zip : raw.address.zip) : '';

                return `${line1} <br/> ${line2}`;
            } else if (raw && raw.geometry && raw.geometry.coordinates[0] !== 0 && raw.geometry.coordinates[1] !== 0) {
                return `${raw.geometry.coordinates[1]}, ${raw.geometry.coordinates[0]}`;
            } else {
                return 'NO GPS';
            }
        }
    }
}
