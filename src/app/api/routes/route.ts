export class Route {
    id?: number;
    name: string;
    long_name?: string;
    description?: string;
    type: string;
    color: string;
    text_color?: string;
    url?: string;
    legs: {
        origin_stop: {
            id: number;
            name?: string;
            geometry?: any;
            boundary?: any;
        };
        dest_stop: {
            id: number;
            name?: string;
            geometry?: any;
            boundary?: any;
        };
        path: any;
        waypoints?: any;
        travel_time: number;
    }[];
}