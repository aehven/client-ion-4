import { environment } from '../environments/environment';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// export const httpInterceptorProviders = [
//   // { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
//   { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
//   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
//   { provide: HTTP_INTERCEPTORS, useClass: VersionInterceptor, multi: true },
//   { provide: HTTP_INTERCEPTORS, useClass: NotificationInterceptor, multi: true }
// ];

import { AngularTokenService,  AngularTokenModule,  AngularTokenOptions} from 'angular-token';
import { ActionCableService } from 'angular2-actioncable';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularTokenModule.forRoot({apiBase: environment.apiPath}),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AngularTokenModule,
    ActionCableService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
