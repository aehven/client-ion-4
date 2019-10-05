import { environment } from '../../environments/environment';

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
  selector: 'app-new-movies',
  templateUrl: './new-movies.page.html',
  styleUrls: ['./new-movies.page.scss'],
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
  public
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

  fileEvent(fileInput: any) {
    const bucket = new S3({
      accessKeyId: 'AKIA6A22SIVVXAHGJJON',
      secretAccessKey: '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',
      region: 'us-west-1'
    });

    for(let file of fileInput.target.files) {
      console.log(file.name);

      let params = {
        Bucket: 'gallo-movies',
        Key: file.name,
        Body: file
      };

      bucket.upload(params, function (err, data) {
        console.log("DATA: ", data);
        console.log("ERROR: ", err);
      });
    }
  }

  uploadAllowed():boolean {
    if(this.fileUploadControl.value.length < 1) {
      return false;
    }

    for(let file of this.fileUploadControl.value) {
      if(
        file['start'] === undefined ||
        file['start'].length < 3 ||
        file['end'] === undefined ||
        file['end'].length < 3 ||
        file['winner'] === undefined ||
        file['winner'].length < 3
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
    }
  }
}
