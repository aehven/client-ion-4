import { environment } from '../../environments/environment';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    try {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if(currentUser && currentUser.jwt) {
        let reqT = req.clone({
          setHeaders: {
            'Content-Type' : 'application/json; charset=utf-8',
            'Accept'       : 'application/json',
            'Authorization': `Bearer ${currentUser.jwt}`
          },
        });
        req = reqT
      }
    }
    catch(error) {
      console.warn("Couldn't set headers in auth interceptor");
    }

    return next.handle(req).pipe( tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
         return;
        }
        setTimeout(() => {
          this.router.navigate(['/login'], {queryParams: {anonymous: environment.allowAnonymousUsers}});
        }, 100);
      }
    }));

  }
}
