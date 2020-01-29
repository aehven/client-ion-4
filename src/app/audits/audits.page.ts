import { environment } from '../../environments/environment';

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

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
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public klass = "audit";
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

  public includeAudits = { User: true, Customer: true, Notification: true};
  public auditTypes = Object.keys(this.includeAudits);

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    private route: ActivatedRoute,
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

  public loadData(event:any=null) {
    if(this.data.length >= this.collectionSize) {
      if(event) {
        event.target.complete();
      }
      return;
    }

    this.page += 1;
    this.gotIt = false;
    this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm, include: JSON.stringify(this.includeAudits)})
    .subscribe( resp => {
      for(let item of resp['data']) {
        this.data.push(item);
      }
      this.collectionSize = resp['meta']['total'];
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
