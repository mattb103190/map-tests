import { TestBed, inject, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { Observable } from 'rxjs/Observable';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiModule, SessionService, OrganizationService, MockOrganizationService } from '../../../api/index';
import { SharedModule } from '../../../shared/shared.module';
import { RoutingNavComponent } from './routing-nav.component';
import { UserService } from '../../../api/user/user.service';
import { MockUserService } from '../../../api/user/user.service.mock';
import { MockLoggedInSessionService } from '../../../api/session/session.service.mock-loggedin';
import { ArrivalAndDepartureService, MockArrivalAndDepartureService } from '../../../api/index';

describe('RoutingNavComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                MomentModule,
                NgbModule.forRoot(),
                ApiModule.forRoot(true),
                ReactiveFormsModule,
                RouterTestingModule,
                SharedModule.forRoot(),
                NgbModalModule
            ],
            declarations: [
                RoutingNavComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        this.fixture = TestBed.createComponent(RoutingNavComponent);
        this.compInstance = this.fixture.componentInstance;
        this.compiled = this.fixture.debugElement.nativeElement;

        spyOn(this.compInstance, 'ngOnInit').and.callThrough();

        this.fixture.detectChanges();
    });

    it('should be able to create component instance', async(() => {
        expect(this.fixture.componentInstance).toBeDefined();
        expect(this.compInstance.ngOnInit).toHaveBeenCalled();
    }));
});
