import {Component, Input} from '@angular/core';

import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mtx-confirmation-modal',
  template: `
    <div id="confirmationModal">
      <div class="modal-header">
          <span class="modal-title pull-left">Are you sure?</span>
          <button type="button" class="close pull-right" aria-label="Close" (click)="activeModal.dismiss('cancel')">
          <span style="color:#fff" aria-hidden="true">&times;</span>
          </button>
      </div>
      <div class="modal-body">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <p>{{message}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sm" (click)="activeModal.close('ok')">OK</button>
        <button type="button" class="btn btn-sm" (click)="activeModal.dismiss('cancel')">Cancel</button>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Input() message;

  constructor(public activeModal: NgbActiveModal) {}
}

