import { environment } from '../../environments/environment';
import { EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AngularTokenService } from 'angular-token';

import { StorageService } from './storage.service';
import { WebSocketsService } from './web-sockets.service';
import { NotificationService } from './notification.service';
import { DataService } from './data.service';
import { User } from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private status: EventEmitter<string> = new EventEmitter();
  private user: User = null;

  constructor(public tokenService: AngularTokenService,
    private router: Router,
    private webSocketsService: WebSocketsService,
    public storage: StorageService,
    public dataService: DataService,
    private notificationService: NotificationService) {
      console.log(`SessionService: ${environment.apiPath}`);
      this.initialize();
  }

  initialize(): void {
    console.log("Session Service init");
    if(this.currentUser) {
      this.handleSignIn();
    }
    else {
      if(environment.allowAnonymousUsers) {
        this.anonymousSignIn();
      }
      else {
        this.router.navigate(['/login']);
      }
    }
  }

  get currentUser(): User {
    if(!(this.user && this.user.email)) {
      if(this.storage.getObj("currentUser")) {
        this.user = new User(this.storage.getObj("currentUser"));
      }
    }
    return this.user;
  }

  updateCurrentUser(data: any): Observable<any> {
    let resp = this.dataService.send("User", this.user.id, data);

    resp.subscribe(res => {
      this.user = new User(res);
      console.log("logged in", this.user);
      this.storage.setObj("currentUser", this.user);
    });

    return resp;
  }

  can(action: string, subject: string) {
    if(this.currentUser) {
      return this.currentUser.can(action, subject);
    }
    else {
      return  false;
    }
  }

  get statusEmitter(): EventEmitter<string> {
    return this.status;
  }

  get isLoggedIn(): any {
    if(this.tokenService.currentAuthData) {
      return true;
    }
    else {
      return false;
    }
  }

  get isStillLoggedIn(): any {
    let response = this.tokenService.validateToken();
    response.subscribe(
        res =>      {
          this.storage.setObj("currentUser", res.data);
        },
        error =>    console.log(error)
    );

    return response;
  }

  signIn(params: any): Observable<any> {
    let res = this.tokenService.signIn(params);

    res.subscribe(data => {
      this.user = new User(this.tokenService.currentUserData);
      console.log("logged in", this.user);
      this.storage.setObj("currentUser", this.user);
      this.storage.serverEnv = this.user['server']; //data.body.data.server

      this.handleSignIn();
    })

    return res;
  }

  handleSignIn(): void {
    this.webSocketsService.initialize(this.user);
    this.getNotifications();

    this.status.emit("LoggedIn");
  }

  anonymousSignIn(): void {
    this.signIn({
        login:    "demo@null.com",
        password: "password"
    }).subscribe(
      res => {
        this.router.navigate([environment.homePath]);
      })
  }

  signOut(): Observable<any> {
    let res = this.tokenService.signOut();

    res.subscribe(() => {
      this.webSocketsService.destroy();
      this.status.emit("LoggedOut");
      this.storage.clear();
    });

    return res;
  }

  resetPassword(params: any): Observable<any> {
    let res = this.tokenService.resetPassword(params);

    return res;
  }

  get authData(): any {
    let authData = this.tokenService.currentAuthData;
    return authData;
  }

  notificationDismissCallback() {
    console.log("notification dismiss callback");
  }

  configDismissCallback() {
    window.location.reload();
  }

  getNotifications():void {
    console.log("getNotifications");

    this.webSocketsService.connect("NotificationChannel", {}).subscribe(message => {
      console.log(`notification incoming message: ${message}`);
      this.notificationService.show({text: message, action: "OK"}, this.notificationDismissCallback);
    });

    this.webSocketsService.connect("ConfigChannel", {}).subscribe(message => {
      console.log(`config incoming message: ${JSON.stringify(message)}`);

      this.storage.serverEnv = message;

      this.notificationService.show({text: "Config Update Available", action: "Reload"}, this.configDismissCallback);
    });
  }

  goHome(): void {
    if(this.currentUser.tac_agreed_at == null) {
      this.router.navigate(['terms-and-conditions']);
    }
    else {
      let redirect = this.storage.getStr("redirectAfterLogin");
      if(redirect) {
        this.storage.remove("redirectAfterLogin");
        this.router.navigateByUrl(redirect);
      }
      else {
        this.router.navigate([environment.homePath]);
      }
    }
  }
}
