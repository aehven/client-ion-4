import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

@Injectable()
export class NotificationInterceptor implements HttpInterceptor {

  constructor(public notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
      return next.handle(req)
        .pipe(
          tap(event => {
              if(event instanceof HttpResponse) {
                let notification = event.headers.get('notification');

                if(notification) {
                  this.notificationService.show(JSON.parse(notification));
                }
              }
            }));
          }
}
