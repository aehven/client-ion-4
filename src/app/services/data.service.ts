import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  async post(path: string, body: Object) {
    return await this.http.post(`${environment.apiPath}/${path}`, body).toPromise();
  }

  async get(path: string, params: any = {}) {
    return this.http.get(`${environment.apiPath}/${path}`, {params: params}).toPromise();
  }

  resourceUrl(resource: string): string {
    return pluralize(resource.toLowerCase().replace("-", "_"));
  }

  async index(resource: string, params: any = {}) {
    return await this.http.get(`${environment.apiPath}/${this.resourceUrl(resource)}`, {params: params}).toPromise();
  }

  async show(resource: string, id: any, params: any = {}) {
    const res = await this.http.get(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {params: params}).toPromise();

    this.setCurrent(res, resource);

    return res;
  }

  async send(resource: string, id: any, values: Object = {}) {
    if(isNaN(id) || id < 1) {
      return await this.create(resource, values);
    }
    else {
      return await this.update(resource, id, values);
    }
  }

  async update(resource: string, id: any, values: Object = {}) {
    const res = await this.http.put(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {[singularize(resource.toLowerCase().replace("-","_"))]: values}).toPromise();

    this.setCurrent(res, resource);

    return res;
  }

  async create(resource: string, values: Object = {}) {
    const res = await this.http.post(`${environment.apiPath}/${this.resourceUrl(resource)}`, {[singularize(resource.toLowerCase().replace("-","_"))]: values}).toPromise();

    return res;
  }

  async delete(resource: string, id: any, params: any = {}) {
    const res = await this.http.delete(`${environment.apiPath}/${this.resourceUrl(resource)}/${id}`, {params: params}).toPromise();

    return res;
  }

  setCurrent(res:any, resource:any): void {
    this.current[resource] = res['data'];
    this.storage.setObj("current", this.current);
  }
}
