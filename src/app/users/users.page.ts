import { environment } from '../../environments/environment';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  public klass = "user";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public data: any;
  public sortBy = "email";
  public sortOrder = "asc";

  public searchTerm = "";
  public collectionSize = 1;
  public page = 1;
  public pageSize = "15";

  public usersBelongToCustomers = environment.usersBelongToCustomers;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    public router: Router) {}

  ngOnInit() {
    this.pageSize = this.storage.getStr(`${pluralize(this.klass)}PageSize`) || "10"
    this.getIndex();
  }

  public pageChanged(event) {
    this.page = event.pageIndex+1;
    this.storage.setStr(`${pluralize(this.klass)}PageSize`, event.pageSize);
    this.pageSize = event.pageSize;
    this.getIndex();
  }

  public getIndex() {
    this.gotIt = false;
    this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm})
    .subscribe( data => {
      this.data = data[pluralize(this.klass)];
      this.collectionSize = data.count;
      this.gotIt = true;
    });
  }

  selectItem(id: number): void {
    this.router.navigate([`/${this.klass}/${id}`]);
  }

  newItem(): void {
    this.router.navigate([`/${this.klass}/new`]);
  }

  search(): void {
    this.getIndex();
  }
}
