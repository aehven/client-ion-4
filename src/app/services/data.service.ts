import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/shareReplay'; //this can go away when updating to rxjs 6.4?; requires npm install rxjs-compat

import { Router } from '@angular/router';

import { pluralize, singularize } from 'inflected';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    public storage: StorageService,
    public router: Router,
    public http: HttpClient) {
      if(this.storage.getObj("current") == null) {
        this.storage.setObj("current", {});
      }
    }

  public current = {};

  post(path: string, body: Object): Observable<any> {
    return this.http.post(`${environment.apiPath}/${path}`, body).shareReplay();
  }

  get(path: string, params: any = {}): Observable<any> {
    return this.http.get(`${environment.apiPath}/${path}`, {params: params}).shareReplay();
  }

  resourceUrl(resource: string): string {
    return pluralize(resource.toLowerCase().replace("-", "_"));
  }

  index(resource: string, params: any = {}): Observable<any> {
    let res = this.http.get(`${environment.apiPath}/${this.resourceUrl(resource)}`, {params: params}).shareReplay();

    return res;
  }

  show(resource: string, id: any, params: any = {}): Observable<any> {
    let res = this.http.get(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {params: params}).shareReplay();

    this.setCurrent(res, resource);

    return res;
  }

  send(resource: string, id: any, values: Object = {}): Observable<any> {
    if(isNaN(id) || id < 1) {
      return this.create(resource, values)
    }
    else {
      return this.update(resource, id, values)
    }
  }

  update(resource: string, id: any, values: Object = {}): Observable<any> {
    let res =  this.http.put(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {[singularize(resource.toLowerCase().replace("-","_"))]: values}).shareReplay();

    this.setCurrent(res, resource);

    return res;
  }

  create(resource: string, values: Object = {}): Observable<any> {
    let res =  this.http.post(`${environment.apiPath}/${this.resourceUrl(resource)}`, {[singularize(resource.toLowerCase().replace("-","_"))]: values}).shareReplay();

    return res;
  }

  delete(resource: string, id: any, params: any = {}): Observable<any> {
    let res =  this.http.delete(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {params: params}).shareReplay();

    return res;
  }

  setCurrent(res:any, resource:any): void {
    res.subscribe(
      res => {
        this.current[resource] = res;
        this.storage.setObj("current", this.current);
      },

      error => {
        console.log("setCurrent error: ", error);
        this.current[resource] = null;
        this.storage.setObj("current", this.current);
      }
    );
  }
}
