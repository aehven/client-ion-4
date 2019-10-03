/////
// https://angular.io/docs/ts/latest/guide/router.html#!#can-activate-guard
/////
import { environment } from '../../environments/environment';

import { Injectable }       from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild
}                           from '@angular/router';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(public sessionService: SessionService, public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.debug("canActivate", route);

    let url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    console.debug("checkLogin", url);

    //on startup, check if token is valid, if it is, sign in as user in cookie.
    if(this.sessionService &&
        this.sessionService.isLoggedIn
      ) {
        return true;
      }

    if(environment.allowAnonymousUsers) {
      this.sessionService.anonymousSignIn();
    }
    else {
      this.router.navigate(['/login']);
    }

    return false;
  }
}
