import { environment } from '../environments/environment';

import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Location } from '@angular/common';

import { DataService } from './data.service';
import { StorageService } from './storage.service';
import { SessionService } from './session.service';
import { NotificationService } from './notification.service';
import { AuthGuardService } from './auth-guard.service';
import { WebSocketsService } from './web-sockets.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  showToolBar = true;
  public opened: boolean = false;
  private routeSub: any;  // subscription to route observer
  public working: boolean = null;
  public allowAnonymousUsers = environment.allowAnonymousUsers;
  public version: string;

  constructor(public router: Router,
    public location: Location,
    public storage: StorageService,
    public dataService: DataService,
    public notificationService: NotificationService,
    public authGuardService: AuthGuardService,
    public webSocketService: WebSocketsService,
    public sessionService: SessionService) {
      this.version = environment.version;
    }

  ngOnInit(): void {
    this.storage.setStr("apiPath", environment.apiPath);

    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if(event.url == "/login" ||
           event.url == "/password-reset-do" ||
           event.url == "/password-reset-request" ||
           event.url == "/terms-and-conditions") {
          this.showToolBar = false;
        }
        else {
          this.showToolBar = true;
        }
      }
    });
  }

  menuClick(selection: string): void {
    console.log(`menu: ${selection}`);
  }

  sidenavOpenedChange(): void {
    this.opened = !this.opened;
  }
}
