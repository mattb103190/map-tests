export class OrganizationQueryOpts {
    name?: string;
    display_name?: string;
    'contact.name'?: string;
    'contact.phone'?: string;
    'contact.addr1'?: string;
    'contact.addr2'?: string;
    'contact.city'?: string;
    'contact.state'?: string;
    'contact.zip'?: string;
    'user.name'?: string;
    'user.email'?: string;
    limit?: number;
    offset?: number;
    sort?: string | string[];
}
