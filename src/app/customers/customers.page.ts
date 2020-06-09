import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
})
export class CustomersPage implements AfterViewInit, OnInit {
  public klass = "customer";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public data: any[] = [];
  public customers;

  public gotIt: boolean = false;
  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public pageSize = 10;

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
      .subscribe( resp => {
        for(let item of resp['data']) {
          item.name = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(item.level) + item.name;
          this.data.push(item);
        }
        this.collectionSize = resp['meta']['total'];
        this.getCustomers(event);
      });
    }

    getCustomers(event:any=null): void {
      this.dataService.index(this.klasses).subscribe(resp => {
        this.customers = resp['data'];
        this.gotIt = true;
        if(event) {
          event.target.complete();
        }
      })
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
