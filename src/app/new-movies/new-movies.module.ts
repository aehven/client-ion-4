import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NewMoviesPage } from './new-movies.page';
import { SharedModule } from '../shared/shared.module';

import { FileUploadModule } from '@iplab/ngx-file-upload';

const routes: Routes = [
  {
    path: '',
    component: NewMoviesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    FileUploadModule
  ],
  declarations: [NewMoviesPage]
})
export class NewMoviesPageModule {}
