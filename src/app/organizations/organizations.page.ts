import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

  public dklass = this.klass;
  public dKlass = titleize(this.dklass);
  public dklasses = pluralize(this.dklass);
  public dKlasses = pluralize(this.dKlass);

  public data: any[] = [];
  public organizations;

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
      this.dklass = this.storage.serverEnv["BTSTC_ORGANIZATION_IS_CALLED"];
      this.dKlass = titleize(this.dklass);
      this.dklasses = pluralize(this.dklass);
      this.dKlasses = pluralize(this.dKlass);
    
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

      const resp = await this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm})

      for(let item of resp['data']) {
        item.name = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(item.level) + item.name;
        this.data.push(item);
      }
      this.collectionSize = resp['meta']['total'];
      this.getOrganizations(event);
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
