import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { SessionService } from '../session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private sessionService: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req).do(event => {
        if (event instanceof HttpResponse) {
        }
      })
      .catch(err => {
        console.log('Caught error', err);

        if(err.status == 401) {
          if(err.url.indexOf("sign_in") == -1) {
            this.sessionService.anonymousSignIn();
          }
        }
        else if(err.status == 403) {
          if(err.url.indexOf("validate_token") == -1 && err.url.indexOf("sign_in") == -1) {
            this.router.navigate([environment.homePath]);
          }
        }

        return Observable.throw(err);
      });
    }
}
