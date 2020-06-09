import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
import { RouterModule } from '@angular/router';

import {HeaderComponent} from './header/header.component';
import {MenuComponent} from './menu/menu.component';
import {UsersComponent} from './users/users.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  declarations: [HeaderComponent, MenuComponent, UsersComponent],
  exports: [CommonModule, HeaderComponent, MenuComponent, UsersComponent]
})
export class SharedModule { }
