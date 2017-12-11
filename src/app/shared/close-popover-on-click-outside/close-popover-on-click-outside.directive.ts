import { Directive, Input, HostListener } from "@angular/core";

@Directive({
    selector: '[closePopoverOnClickOutside]'
})
export class ClosePopoverOnClickOutsideDirective {

    active = false;

    @Input() closePopoverOnClickOutside: { close: Function; isOpen: Function };

    @HostListener('document:click', ['$event.target'])
    docClicked(target): Boolean {

        if (!this.closePopoverOnClickOutside.isOpen()) {
            this.active = false;
            return true;
        }
        // Click that opens popover triggers this. Ignore first click.
        if (!this.active) {
            this.active = true;
            return true;
        }

        let cancelClose = false;
        const popoverWindows = document.getElementsByTagName('ngb-datepicker');

        for (let i = 0; i < popoverWindows.length; i++) {
            cancelClose = cancelClose || popoverWindows[i].contains(target);
        }

        if (!cancelClose) {
            this.closePopoverOnClickOutside.close();
        }

        // Deactivate if something else closed popover
        this.active = this.closePopoverOnClickOutside.isOpen();

        return true;
    }
}
