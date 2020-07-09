import { environment } from '../../environments/environment';
import { EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

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

  constructor(
    private router: Router,
    private webSocketsService: WebSocketsService,
    public storage: StorageService,
    public dataService: DataService,
    private apollo: Apollo,
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

  // async updateCurrentUser(data: any) {
  //   const resp = await this.dataService.send("User", this.user.id, data);
  //   this.user = new User(resp['data']);
  //   console.log("logged in", this.user);
  //   this.storage.setObj("currentUser", this.user);
  // }

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
    if(this.currentUser.jwt) {
      return true;
    }
    else {
      return false;
    }
  }

  get isStillLoggedIn(): any {
    return true;
  }

  async signIn(params: any) {
    const mutation = gql`
      mutation signIn {
        userAuthenticate(input: {email: "${params.email}", password: "${params.password}"}) {
          jwt
        }
    }`;

    const resp = await this.apollo.mutate({mutation: mutation}).toPromise();

    this.user = new User({email: params.email, jwt: resp.data['userAuthenticate']['jwt']});
    console.log("logged in", this.user);
    this.storage.setObj("currentUser", this.user);

    this.handleSignIn();

    return resp;
  }

  async handleSignIn() {
    const resp = await this.dataService.get("/get_profile");
    this.storage.serverEnv = resp['server'];
    this.user.mergeValues(resp['profile']);
    this.storage.setObj("currentUser", this.user);

    this.webSocketsService.initialize(this.user);
    this.getNotifications();

    this.status.emit("LoggedIn");
  }

  async anonymousSignIn() {
    await this.signIn({login:    "demo@null.com", password: "password"});
    this.router.navigate([environment.homePath]);
  }

  signOut() {
    this.webSocketsService.destroy();
    this.status.emit("LoggedOut");
    this.storage.clear();

    if(environment.allowAnonymousUsers) {
      this.anonymousSignIn();
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  get authData(): any {
    return this.currentUser.jwt;
  }

  notificationDismissCallback() {
    console.log("notification dismiss callback");
  }

  configDismissCallback() {
    window.location.reload();
  }

  getNotifications():void {
    console.log("getNotifications");

    let connectionN = this.webSocketsService.connect("NotificationChannel", {});
    if(connectionN) {
      connectionN.subscribe(notification => {
        console.log(`notification incoming message: ${notification}`);
        this.notificationService.show(notification, this.notificationDismissCallback);
      });
    }

    let connectionNU  = this.webSocketsService.connect("NotificationChannel", {user_id: this.user.id})
    if(connectionNU) {
      connectionNU.subscribe(notification => {
        console.log(`notification incoming message: ${notification}`);
        this.notificationService.show(notification, this.notificationDismissCallback);
      });
    }

    let connectionC = this.webSocketsService.connect("ConfigChannel", {});
    if(connectionC) {
      connectionC.subscribe(message => {
        console.log(`config incoming message: ${JSON.stringify(message)}`);

        this.storage.serverEnv = message;

        this.notificationService.show({text: "Config Update Available", action: "Reload"}, this.configDismissCallback);
      });
    }
  }

  goHome(): void {
    // if(this.currentUser.tac_agreed_at == null) {
    //   this.router.navigate(['terms-and-conditions']);
    // }
    // else {
      let redirect = this.storage.getStr("redirectAfterLogin");
      if(redirect) {
        this.storage.remove("redirectAfterLogin");
        this.router.navigateByUrl(redirect);
      }
      else {
        this.router.navigate([environment.homePath]);
      }
    // }
  }
}
