import { environment } from '../../environments/environment';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import {HeaderComponent} from './header/header.component';
import {MenuComponent} from './menu/menu.component';
import {UsersComponent} from './users/users.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: environment.graphqlUri
          })
        }
      },
      deps: [HttpLink]
    }],
  declarations: [HeaderComponent, MenuComponent, UsersComponent],
  exports: [CommonModule, HeaderComponent, MenuComponent, UsersComponent, ApolloModule, HttpLinkModule]
})
export class SharedModule { }
