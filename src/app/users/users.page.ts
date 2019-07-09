import { environment } from '../../environments/environment';

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public klass = "user";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public data: any[] = [];
  public sortBy = "email";
  public sortOrder = "asc";

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public pageSize = 25;

  public usersBelongToCustomers = environment.usersBelongToCustomers;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    public router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  public loadData(event:any=null) {
    console.log("loadData");
    this.page += 1;
    this.gotIt = false;
    this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm})
    .subscribe( data => {
      // this.data = data[pluralize(this.klass)];
      for(let item of data[pluralize(this.klass)]) {
        this.data.push(item);
      }
      // this.data = [...this.data, data[pluralize(this.klass)]],
      // this.data.concat(data[pluralize(this.klass)][0]);
      this.collectionSize = data.count;
      this.gotIt = true;
      if(event) {
        event.target.complete();
      }
    });
  }

  selectItem(id: number): void {
    this.router.navigate([`/${this.klass}/${id}`]);
  }

  newItem(): void {
    this.router.navigate([`/${this.klass}/new`]);
  }

  search(): void {
    this.page = 0;
    this.loadData();
  }
}
