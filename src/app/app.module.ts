import { environment } from '../environments/environment';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ApplicationRef } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";

import { AngularTokenService,  AngularTokenModule,  AngularTokenOptions} from 'angular-token';
import { ActionCableService } from 'angular2-actioncable';

import { MatButtonToggleModule, MatGridListModule, MatDividerModule, MatTooltipModule, MatProgressSpinnerModule, MatExpansionModule, MatRadioModule, MatDatepickerModule, MatPaginatorModule, MatFormFieldModule, MatTabsModule, MatDialogModule, MatToolbarModule, MatSidenavModule, MatSnackBarModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatCardModule } from '@angular/material';
import {MatIconModule} from '@angular/material/icon';

// import { NoopInterceptor } from './interceptors/noop-interceptor';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { VersionInterceptor } from './interceptors/version-interceptor';
import { NotificationInterceptor } from './interceptors/notification-interceptor';
import { LoggingInterceptor } from './interceptors/logging-interceptor';

export const httpInterceptorProviders = [
  // { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: VersionInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: NotificationInterceptor, multi: true }
];

import { AuthGuardService } from './auth-guard.service';

import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { AnonymousOverlayComponent } from './anonymous-overlay/anonymous-overlay.component';
import { HomeComponent } from './home/home.component';
import { UserListComponent } from './user-list/user-list.component';
import { AuditComponent } from './audit/audit.component';
import { AuditListComponent } from './audit-list/audit-list.component';
import { PrettyChangesetPipe } from './pretty-changeset.pipe';
import { NotificationComponent } from './notification/notification.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PasswordResetRequestComponent } from './password-reset-request/password-reset-request.component';
import { PasswordResetDoComponent } from './password-reset-do/password-reset-do.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuardService] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService] },
  { path: 'user/:id', component: UserComponent, canActivate: [AuthGuardService]  },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuardService]  },
  { path: 'audit/:id', component: AuditComponent, canActivate: [AuthGuardService] },
  { path: 'audits', component: AuditListComponent, canActivate: [AuthGuardService] },
  { path: 'customer/:id', component: CustomerComponent, canActivate: [AuthGuardService] },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuardService] },
  { path: 'notification/:id', component: NotificationComponent, canActivate: [AuthGuardService] },
  { path: 'notifications', component: NotificationListComponent, canActivate: [AuthGuardService] },
  { path: 'password-reset-request', component: PasswordResetRequestComponent},
  { path: 'password-reset-do', component: PasswordResetDoComponent},
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent},
  // { path: 'unsubscribe', component: UnsubscribeComponent},
  // { path: 'terms-and-conditions', component: TermsAndConditionsComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    LoginComponent,
    MenuComponent,
    AnonymousOverlayComponent,
    HomeComponent,
    UserListComponent,
    AuditComponent,
    AuditListComponent,
    PrettyChangesetPipe,
    NotificationComponent,
    NotificationListComponent,
    CustomerComponent,
    CustomerListComponent,
    DashboardComponent,
    PasswordResetRequestComponent,
    PasswordResetDoComponent,
    TermsAndConditionsComponent,
  ],
  imports: [
    AngularTokenModule.forRoot({apiBase: environment.apiPath}),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    FlexLayoutModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule, MatGridListModule, MatDividerModule, MatTooltipModule, MatIconModule, MatProgressSpinnerModule, MatExpansionModule, MatRadioModule, MatDatepickerModule, MatPaginatorModule, MatFormFieldModule, MatTabsModule, MatDialogModule, MatToolbarModule, MatSidenavModule, MatSnackBarModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatCardModule,
  ],
  providers: [
    AngularTokenModule,
    httpInterceptorProviders,
    ActionCableService
  ],
  entryComponents: [
  AppComponent //CORDOVA for manual bootstrap; no need for this it automatic bootstrap
  ]
// ,
  // bootstrap: [AppComponent]
})

export class AppModule {
  ngDoBootstrap(app: ApplicationRef) {
    let isCordovaApp = !!window['cordova'];  //CORDOVA

    if(isCordovaApp) { //CORDOVA
      let onDeviceReady = () => {
        app.bootstrap(AppComponent);
        // platformBrowserDynamic().bootstrapModule(AppModule);
      };
      document.addEventListener('deviceready', onDeviceReady, false);
    }
    else {
      app.bootstrap(AppComponent);
    }
  }
}
