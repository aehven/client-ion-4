import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuardService]},
  { path: 'user/:id', loadChildren: './user/user.module#UserPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'users', loadChildren: './users/users.module#UsersPageModule' },
  { path: 'movies', loadChildren: './movies/movies.module#MoviesPageModule' },
  { path: 'home', loadChildren: './movies/movies.module#MoviesPageModule' },
  { path: 'customer/:id', loadChildren: './customer/customer.module#CustomerPageModule' },
  { path: 'customers', loadChildren: './customers/customers.module#CustomersPageModule' },
  { path: 'notification/:id', loadChildren: './notification/notification.module#NotificationPageModule' },
  { path: 'notifications', loadChildren: './notifications/notifications.module#NotificationsPageModule' },
  { path: 'terms-and-conditions', loadChildren: './terms-and-conditions/terms-and-conditions.module#TermsAndConditionsPageModule' },
  { path: 'movies', loadChildren: './movies/movies.module#MoviesPageModule' },
  { path: 'new-movies', loadChildren: './new-movies/new-movies.module#NewMoviesPageModule' },
  { path: 'trash', loadChildren: './trash/trash.module#TrashPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload', preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
