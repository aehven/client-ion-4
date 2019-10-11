import { Observable } from 'rxjs';
import 'rxjs/add/operator/shareReplay'; //this can go away when updating to rxjs 6.4?; requires npm install rxjs-compat

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';
import { S3Service } from '../services/s3.service';

import { FileUploadControl } from '@iplab/ngx-file-upload';

let dataService = null;

@Component({
  selector: 'app-new-movies',
  templateUrl: './new-movies.page.html',
  styleUrls: ['../movies/movies.page.scss'],
})
export class NewMoviesPage implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public klass = "movie";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data: any[] = [];

  public searchTerm = "";
  public collectionSize = 1;
  public page = 0;
  public pageSize = 10;

  public fileUploadControl = new FileUploadControl().setListVisibility(false);

  private timeRegex = new RegExp(/^[0-5]?\d:[0-5]\d$/); // thanks to https://stackoverflow.com/a/49132992

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

    dataService = this.dataService;
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
    this.page = 0;
    this.data = [];
    this.loadData();
  }

  top(): void {
    let element = document.getElementById("top");
    element.scrollIntoView();
  }

  checkItem(item) {
    delete item['startError'];
    delete item['endError'];
    delete item['winnerError'];

    if(!this.timeRegex.test(item.start)) {
      item.startError = true;
    }

    if(!this.timeRegex.test(item.end)) {
      item.endError = true;
    }

    if(!['ROJO', 'VERDE', 'TABLAS'].includes(item.winner)) {
      item.winnerError = true;
    }
  }

  uploadAllowed():boolean {
    if(this.fileUploadControl.value.length < 1) {
      return false;
    }

    for(let file of this.fileUploadControl.value) {
      if(!(
        this.timeRegex.test(file['start']) &&
        this.timeRegex.test(file['end']) &&
        ['ROJO', 'VERDE', 'TABLAS'].includes(file['winner']))
      ) {
        return false;
      }
    }

    return true;
  }

  performUpload() {
    for(let file of this.fileUploadControl.value) {
      console.log(file.name);
      console.log(file);
      file['url'] = `https://gallo-movies.s3-us-west-1.amazonaws.com/${file.name}`;

      this.dbCreate(file).subscribe(
        res => {
          this.s3Create(file);
          // if(!this.s3Create(file)) {
          //   this.dataService.delete(this.klass, file['id'])
          // }
        }
      )
    }
  }

  dbCreate(file: any): Observable<any> {
    delete file['success'];
    delete file['errorMessage'];

    file['processing'] = true;

    let response = this.dataService.create(this.klass, file);
    response.subscribe(
      res =>  {
        console.log("dbCreate", res);
        file['success'] = true;
        file['id'] = res.id;
        delete file['processing'];
      },
      error => {
        console.error("dbCreate", error);
        file['errorMessage'] = error.error.message || "Unknown Error";
        delete file['processing'];
      }
    );

    return response;
  }

  dbDelete(file: any) {
    dataService.delete("movie", file['id']).subscribe(
      res => {
        file['errorMessage'] = "s3Create bucket upload failed and db rollback succeeded";
        console.log(file['errorMessage'], res);
        delete file['processing'];
      },
      error => {
        file['errorMessage'] = "s3Create bucket upload failed and db rollback failed";
        console.log(file['errorMessage'], error);
        delete file['processing'];
      }
    )
  }

  s3Create(file: any) {
    delete file['success'];
    delete file['errorMessage'];

    file['processing'] = true;

    this.S3Service.upload({Bucket: 'gallo-movies', Key: file.name, Body: file}).subscribe(
      data => {
        file['success'] = true;
        delete file['processing'];
      },
      error => {
        this.dbDelete(file);
        delete file['processing'];
      }
    )
  }
}
