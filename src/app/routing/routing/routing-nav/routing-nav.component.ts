import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Organization, User, UserService, OrganizationService } from '../../../api/index';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
    selector: 'mtx-routing-nav',
    templateUrl: './routing-nav.component.html',
    styleUrls: ['./routing-nav.component.css']

})
export class RoutingNavComponent implements OnInit {

    @Input() selectedTab: string;
    isCollapsed = true;
    admin = false;
    super = false;
    permissions = [];
    orgType = '';

    loadingRequest: Observable<[User, Organization]>;

    constructor(private userService: UserService, private organizationService: OrganizationService) {
    }

    ngOnInit() {
        this.loadingRequest = Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.organizationService.getCurrentOrganization()
        );
        this.loadingRequest.subscribe(
            res => {
                this.loadingRequest = null;
                this.admin = res[0].admin;
                this.super = res[0].super;
                this.permissions = res[0].permission;
                this.orgType = res[1].type;
            },
            error => {
            });
    }
}
