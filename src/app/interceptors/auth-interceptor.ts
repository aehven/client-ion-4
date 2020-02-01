import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    try {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let reqT = req.clone({
        setHeaders: {
          'Content-Type' : 'application/json; charset=utf-8',
          'Accept'       : 'application/json',
          'Authorization': `Bearer ${currentUser.jwt}`
        },
      });
      req = reqT
    }
    catch(error) {
      console.warn("Couldn't set headers in auth interceptor");
    }

    return next.handle(req).do(event => {
        if (event instanceof HttpResponse) {
        }
      })
      .catch(err => {
        if(err.status == 401 || err.status == 403) {
          this.router.navigate(['/login'], {queryParams: {anonymous: environment.allowAnonymousUsers}});
        }

        return Observable.throw(err);
      });
    }
}
