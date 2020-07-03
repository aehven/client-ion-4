import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.page.html',
  styleUrls: ['./organizations.page.scss'],
})
export class OrganizationsPage implements AfterViewInit, OnInit {
  public klass = "organization";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public data: any[] = [];
  public organizations;

  public gotIt: boolean = false;
  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public perPage = 10;
  public kind = null;

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

        if(params["kind"]) {
          this.kind = params["kind"]
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
          organizations(page: ${this.page}) {
            id
            name
            level
            kind
          }
        }
      `

      const resp = await this.apollo.query({query: query}).toPromise();

      if(resp.data && resp.data['organizations']) {
        for(let item of resp.data['organizations']) {
          item.name = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(item.level) + item.name;
          this.data.push(item);
        }
      }
      else if(resp.errors) {
        console.error(JSON.stringify(resp.errors));
      }

      // this.collectionSize = resp['meta']['total'];
      // this.getOrganizations(event);
    }

    async getOrganizations(event:any=null) {
      const resp = await this.dataService.index(this.klasses);
        this.organizations = resp['data'];
        this.gotIt = true;
        if(event) {
          event.target.complete();
        }
    }

    selectItem(id: number): void {
      this.router.navigate([`/${this.klass}/${id}`]);
    }

    newItem(): void {
      this.router.navigate([`/${this.klass}/new`]);
    }

    search(event): void {
      this.searchTerm = event.target.value;
      this.page = 0;
      this.data = [];
      this.loadData();
    }
}
