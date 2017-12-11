export class Organization {
    id: number;
    name: string;
    display_name: string;
    contact?: {
        name?: string,
        phone?: string,
        addr1?: string,
        addr2?: string,
        city?: string,
        state?: string,
        zip?: string
    };
    time_zone: string;
    apikey?: string;
    type: string;
    user?: {
        id?: number,
        name?: string,
        email?: string,
        password?: string
    };
    has_public_routes?: boolean;
}
