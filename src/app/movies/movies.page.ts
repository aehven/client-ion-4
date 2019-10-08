import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

import { FileUploadControl } from '@iplab/ngx-file-upload';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
})
export class MoviesPage implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public klass = "movie";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data: any[] = [];

  public searchTerm = "";
  public errorsOnly:boolean = false;
  public collectionSize = 1;
  public page = 0;
  public pageSize = 10;

  public fileUploadControl = new FileUploadControl().setListVisibility(false);

  private s3 = new S3({
    accessKeyId: 'AKIA6A22SIVVXAHGJJON',
    secretAccessKey: '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',
    region: 'us-west-1'
  });

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
    this.dataService.index(this.klass, {per_page: this.pageSize, page: this.page, search: this.searchTerm, errors_only: this.errorsOnly})
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
    this.collectionSize = 9999999; //force reload in loadData when search terms change
    this.page = 0;
    this.data = [];
    this.loadData();
  }

  top(): void {
    let element = document.getElementById("top");
    element.scrollIntoView();
  }

  change(item) {
    this.dataService.update(this.klass, item.id, item).subscribe(
      data => {
        console.log("changed: ", data);
      },
      error => {
        console.error("not changed", error);
      }
    )
  }

  delete(item) {
    if(confirm("Are you sure?")) {
      item.processing = true;
      this.dataService.delete(this.klass, item.id).subscribe(
        data => {
          console.log("deleted", data);
          this.s3Delete(item);
        },
        error => {
          console.error("not deleted", error);
          item.errorMessage = `Couldn't delete from DB: ${error}`;
          this.s3Delete(item);
        }
      )
    }
  }

  s3Delete(item:any) {
    let key = item.url.substring(item.url.lastIndexOf('/') + 1)
    console.log("s3Delete", key);

    let params = {
      Bucket: 'gallo-movies',
      Key: key
    };

    this.s3.deleteObject(params, function(error, data) {
      if(data) {
        console.log("s3Delete", data);
        item.deleted = true
        delete item['processing'];
      }
      else if(error) {
        console.log("s3Delete failed", error);
        delete item['processing'];
        item.errorMessage = `${item.errorMessage}; ${error}`;
      }
    });
  }
}
