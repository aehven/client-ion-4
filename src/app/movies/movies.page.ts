import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';
import { S3Service } from '../services/s3.service';

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

  constructor(public sessionService: SessionService,
    public dataService: DataService,
    public storage: StorageService,
    private route: ActivatedRoute,
    private S3Service: S3Service,
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
    let regex = new RegExp(/^[0-5]?\d:[0-5]\d$/); // thanks to https://stackoverflow.com/a/49132992

    delete item['startError'];
    delete item['endError'];

    if(!regex.test(item.start)) {
      item.startError = true;
      return;
    }

    if(!regex.test(item.end)) {
      item.endError = true;
      return;
    }

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
          this.trash(item);
        },
        error => {
          console.error("not deleted", error);
          item.errorMessage = `Couldn't delete from DB: ${error}`;
          this.trash(item);
        }
      )
    }
  }

  trash(item) {
    item.processing = true;

    let key = item.url.substring(item.url.lastIndexOf('/') + 1);

    this.S3Service.copyObject({Bucket: "gallo-trash", CopySource: `gallo-movies/${key}`, Key: key}).subscribe(
      data => {
        item.copied = true;
        this.S3Service.deleteObject({Bucket: 'gallo-movies', Key: key}).subscribe(
          data => {
            item.deleted = true
            delete item['processing'];
          },
          error => {
            delete item['processing'];
            item.errorMessage = `Copied to trash but can't delete from active: ${error}`
          }
        );
      },
      error => {
        item.errorMessage = `Can't copy from active to trash: ${error}`;
        delete item['processing'];
      }
    )
  }
}
