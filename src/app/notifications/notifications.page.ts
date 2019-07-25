import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements AfterViewInit {
  public klass = "notification";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public data: any[] = [];

  public gotIt: boolean = false;
  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public pageSize = 10;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    public router: Router) {}

    ngAfterViewInit() {
      this.loadData();
    }

    public loadData(event:any=null) {
      if(this.data.length >= this.collectionSize) {
        if(event) {
          event.target.complete();
        }
        return;
      }

      this.page += 1;
      this.gotIt = false;
      this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm})
      .subscribe( data => {
        for(let item of data[pluralize(this.klass)]) {
          this.data.push(item);
        }
        this.collectionSize = data['meta']['total'];
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
      this.data = [];
      this.loadData();
    }
}
