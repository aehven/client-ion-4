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
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})
export class PatientsComponent implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  @Input()
  organizationId: number = null;

  public klass = "patient";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data;// any[] = [];

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public perPage = 10;

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
            patients(page: ${this.page}, perPage: ${this.perPage}) {
              id
              fullName
              email
            }
          }
    `;
    
    const resp = await this.apollo.query({query: query}).toPromise();
    
    if(resp.data && resp.data['patients']) {
      this.data = resp.data['patients'];
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

  search(event): void {
    this.searchTerm = event.target.value;
    this.page = 0;
    this.data = [];
    this.loadData();
  }
}