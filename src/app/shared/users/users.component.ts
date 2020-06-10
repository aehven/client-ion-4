import { environment } from '../../../environments/environment';

import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

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
  customerId: number = null;

  public klass = "user";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data: any[] = [];

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public pageSize = 10;

  public usersBelongToCustomers = environment.usersBelongToCustomers;

  constructor(public sessionService: SessionService,
    public dataService: DataService,
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
    if(this.data.length >= this.collectionSize) {
      if(event) {
        event.target.complete();
      }
      return;
    }

    this.page += 1;
    this.gotIt = false;
    
    let params = {
      per_page: this.pageSize, 
      page: this.page, 
      search: this.searchTerm,
    };

    if(this.customerId && !isNaN(this.customerId)) {
      params['customer_id'] = this.customerId;
    }

    const resp = await this.dataService.index(this.klass, params);
    for(let item of resp['data']) {
      this.data.push(item);
    }
    this.collectionSize = resp['meta']['total'];
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
