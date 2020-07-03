import { Component, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

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
  public perPage = 10;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    private route: ActivatedRoute,
    private apollo: Apollo,
    public router: Router) {}

    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        if(params["reload"]) {
          this.data = [];
          this.page = 0;
          this.loadData();
        }
      })
    }

    ngAfterViewInit() {
      this.loadData();
    }

    public async loadData(event:any=null) {
      if(this.data.length >= this.collectionSize) {
        if(event) {
          event.target.complete();
        }
        return;
      }

      this.page += 1;
      this.gotIt = false;

      const query = gql`
      query {
        notifications(page: ${this.page}, perPage: ${this.perPage}) {
          id
          createdAt
          level
          title
          text
        }
      }
      `;

      const resp = await this.apollo.query({query: query}).toPromise();

      if(resp.data && resp.data['notifications']) {
        this.data = resp.data['notifications'];
      }
      else if(resp.errors) {
        console.error(JSON.stringify(resp.errors));
      }

      // this.collectionSize = resp['meta']['total'];
      // if(event) {
      //   event.target.complete();
      // }

      this.gotIt = true;
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
