import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';
import { S3Service } from '../services/s3.service';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['./trash.page.scss'],
})
export class TrashPage implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  public klass = "movie";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  public gotIt: boolean = false;
  public data: any[] = [];

  public searchTerm = "";
  public errorsOnly:boolean = false;
  public collectionSize = 999999;
  public page = 0;
  public pageSize = 10;

  private timeRegex = new RegExp(/^[0-5]?\d:[0-5]\d$/); // thanks to https://stackoverflow.com/a/49132992

  private nextContinuationToken = null;

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

    this.s3List();
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
  }

  s3List() {
    this.gotIt = false;
    this.S3Service.listObjects({Bucket: 'gallo-trash', MaxKeys: 10, ContinuationToken: this.nextContinuationToken}).subscribe(
      data => {
        this.gotIt = true;
        this.nextContinuationToken = data.NextContinuationToken;

        for(let item of data.Contents) {
          this.data.push({url: item.Key, hasError: false})
        }

        if(!this.nextContinuationToken) {
          this.collectionSize = this.data.length;
        }
      },
      error => {

      }
    )
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

    item.hasError = item.startError || item.endError || item.winnerError;
  }

  putBack(item) {
    item.processing = true;

    this.dataService.create(this.klass, item).subscribe(
      data => {
        console.log("putBack created: ", data);

        let key = item.url.substring(item.url.lastIndexOf('/') + 1);

        this.S3Service.copyObject({Bucket: "gallo-movies", CopySource: `gallo-trash/${key}`, Key: key}).subscribe(
          data => {
            item.copied = true;
            this.S3Service.deleteObject({Bucket: 'gallo-trash', Key: key}).subscribe(
              data => {
                item.deleted = true
                delete item['processing'];
              },
              error => {
                delete item['processing'];
                item.errorMessage = `Copied to active but can't delete from trash: ${error}`
              }
            );
          },
          error => {
            item.errorMessage = `Can't copy from trash to active: ${error}`
          }
        )
      },
      error => {
        console.error("putBack failed creation", error);
      }
    )
  }
}
