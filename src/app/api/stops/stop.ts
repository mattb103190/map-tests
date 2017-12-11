export class Stop {
    id?: number;
    name: string;
    code?: string;
    description?: string;
    location_type?: string;
    has_wheelchair_boarding?: boolean;
    url?: string;
    geometry: {
        type?: string;
        coordinates?: number[];
    };
    boundary: {
        type?: string;
        coordinates?: number[][][];
    };
}
