import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class S3Service {

  private s3 = new S3({
    accessKeyId: 'AKIA6A22SIVVXAHGJJON',
    secretAccessKey: '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',
    region: 'us-west-1'
  });

  constructor() { }

  // returning observables from aws sdk: https://stackoverflow.com/a/56328868

  upload(params): Observable<any> {
    return Observable.create(observer => {
      this.s3.upload(params, function(error, data) {
        if(data) {
          console.log("upload", data);
          observer.next(data);
          observer.complete();
        }
        else if(error) {
          console.log("upload failed", error);
          observer.error(error);
        }
      });
    });
  }

  deleteObject(params): Observable<any> {
    return Observable.create(observer => {
      this.s3.deleteObject(params, function(error, data) {
        if(data) {
          console.log("deleteObject", data);
          observer.next(data);
          observer.complete();
        }
        else if(error) {
          console.log("deleteObject failed", error);
          observer.error(error);
        }
      });
    });
  }
}
