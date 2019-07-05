import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

@Injectable()
export class VersionInterceptor implements HttpInterceptor {

  constructor(public notificationService: NotificationService) {}

  update() {
    window.location.reload();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
      return next.handle(req)
        .pipe(
          tap(event => {
              if(event instanceof HttpResponse) {
                let serverVersion = event.headers.get('app-version');
                if(serverVersion != environment.version) {
                  this.notificationService.show({text: "Update Available", action: "REFRESH"}, this.update);
                }
              }
            }));
          }
}
