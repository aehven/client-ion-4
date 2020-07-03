import { environment } from '../../../environments/environment';

import { map } from 'rxjs/operators';

import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../../services/data.service';
import { StorageService } from '../../services/storage.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  @Input()
  organizationId: number = null;

  public klass = "user";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data;// any[] = [];

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public perPage = 10;

  public usersBelongToOrganizations = environment.usersBelongToOrganizations;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    private apollo: Apollo,
    public storage: StorageService,
    private route: ActivatedRoute,
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
    if(this.data && this.data.length >= this.collectionSize) {
      if(event) {
        event.target.complete();
      }
      return;
    }

    this.page += 1;
    this.gotIt = false;

    const query = gql`
          query  {
            users(page: ${this.page}, perPage: ${this.perPage}) {
              id
              fullName
              organizationNameWithAncestors
              email
              role
            }
          }
    `;
    
    const resp = await this.apollo.query({query: query}).toPromise();
    
    this.data = resp.data['users'];

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

  search(event): void {
    this.searchTerm = event.target.value;
    this.page = 0;
    this.data = [];
    this.loadData();
  }
}
