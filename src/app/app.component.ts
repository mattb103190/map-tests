import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'mtx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  isProduction = environment.production;
  isLoadingRoute = false;

  constructor(private router: Router) {
    router.events.subscribe((event: Event) => {
      this._navigationInterceptor(event);
    });
  }

  private _navigationInterceptor(event: Event): void {
    if (event instanceof NavigationStart) {
      this.isLoadingRoute = true;
    } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
      this.isLoadingRoute = false;
    } else if (event instanceof NavigationError) {
      if (environment.production) {
        window.location.href = window.location.origin + event.url;
      } else {
        this.isLoadingRoute = false;
        console.log(event);
      }
    }
  }
}
