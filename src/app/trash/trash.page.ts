import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

var proxy = null;

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['../movies/movies.page.scss'],
})
export class TrashPage implements OnInit, AfterViewInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

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

    proxy = this;
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

  s3List() {
    // scrolling isn't working, so we're getting 1000 and hoping that's all.
    // repeated fetches after end of list get the same list again instead of empty contents.

    let params = {
      Bucket: 'gallo-trash',
      MaxKeys: 1000,
      ContinuationToken: this.nextContinuationToken
    };

    this.s3.listObjectsV2(params, function(error, data) {
      this.gotIt = false;

      if(data) {
        proxy.gotIt = true;

        console.log("s3List data", data);

        if(data.KeyCount == 0) {
          proxy.collectionSize = proxy.data.length;
        }
        else {
          for(let item of data.Contents) {
            proxy.data.push({url: item.Key, hasError: false})
          }

          proxy.nextMarker = data.NextContinuationToken;
        }
      }
      else if(error) {
        console.error("s3List", error);
      }
    });
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
    this.s3Copy(item);
  }

  s3Copy(item) {
    let params = {
      Bucket: "gallo-movies",
      CopySource: `gallo-trash/${encodeURI(item.url)}`,
      Key: item.url
    }

    this.s3.copyObject(params, function(error, data) {
      if(data) {
        item.copied = true;
      }
      else if(error) {
        console.log("s3Copy", error);
      }
    })
  }
}
