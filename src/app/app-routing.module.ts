import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'user/:id', loadChildren: './user/user.module#UserPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'organization/:id', loadChildren: './organization/organization.module#OrganizationPageModule' },
  { path: 'organizations', loadChildren: './organizations/organizations.module#OrganizationsPageModule' },
  { path: 'notification/:id', loadChildren: './notification/notification.module#NotificationPageModule' },
  { path: 'notifications', loadChildren: './notifications/notifications.module#NotificationsPageModule' },
  { path: 'terms-and-conditions', loadChildren: './terms-and-conditions/terms-and-conditions.module#TermsAndConditionsPageModule' },
  // { path: 'audit/:id', loadChildren: './audit/audit.module#AuditPageModule' },
  { path: 'audits', loadChildren: './audits/audits.module#AuditsPageModule' },
  { path: 'users-all', loadChildren: './users-all/users-all.module#UsersAllPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload', preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
