import { environment } from '../../environments/environment';

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-audits',
  templateUrl: './audits.page.html',
  styleUrls: ['./audits.page.scss'],
})
export class AuditsPage implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  public klass = "audit";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data: any[] = [];

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public perPage = 10;

  public usersBelongToOrganizations = environment.usersBelongToOrganizations;

  public includeAudits = { User: true, Organization: true, Notification: true};
  public auditTypes = Object.keys(this.includeAudits);

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    private route: ActivatedRoute,
    private apollo: Apollo,
    public router: Router) {}

  ngOnInit() {
    let stored = this.storage.getObj("includeAudits");
    if(stored) {
      Object.assign(this.includeAudits, stored);
    }

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
          query  {
            audits(page: ${this.page}, perPage: ${this.perPage}) {
              id
              createdAt
              performedBy
              event
              itemType
              itemString
              jsonChangeset
            }
          }
    `;
    
    const resp = await this.apollo.query({query: query}).toPromise();
    
    if(resp.data && resp.data['audits']) {
      this.data = resp.data['audits'];
    }
    else if(resp.errors) {
      console.error(JSON.stringify(resp.errors));
    }

    // this.collectionSize = resp['meta']['total'];
    // this.gotIt = true;
    // if(event) {
    //   event.target.complete();
    // }
  }

  selectItem(id: number): void {
    this.router.navigate([`/${this.klass}/${id}`]);
  }

  newItem(): void {
    this.router.navigate([`/${this.klass}/new`]);
  }

  search(): void {
    this.collectionSize = 999999999;
    this.page = 0;
    this.data = [];
    this.loadData();
  }

  inclusionChanged(): void {
    this.storage.setObj("includeAudits", this.includeAudits);
    this.search();
  }
}
