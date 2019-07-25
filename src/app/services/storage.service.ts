import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {
  }

  setObj(name: string, obj: object): void {
    try {
      localStorage.setItem(name, JSON.stringify(obj));
    }
    catch(error) {
      console.error(error);
    }
  }

  getObj(name: string): any {
    try {
      return JSON.parse(localStorage.getItem(name));
    }
    catch(error) {
      console.error(error);
      return null;
    }
  }

  setStr(name: string, str: string): void {
    try {
      localStorage.setItem(name, str);
    }
    catch(error) {
      console.error(error);
    }
  }

  getStr(name: string): string {
    try {
      return localStorage.getItem(name);
    }
    catch(error) {
      console.error(error);
      return null;
    }
  }

  remove(name: string): void {
    localStorage.removeItem(name);
  }

  clear(): void {
    //keep apiPath so that we still have it to log back in again
    //if we logged out but didn't reload the page (very likely)
    //before logging in again.
    let tmp = this.getStr("apiPath");
    localStorage.clear();
    this.setStr("apiPath", tmp);
  }

  getCurrent(key: string) : object {
    let obj = null;

    try {
      let current = this.getObj("current");
      obj = current[key]
    }
    catch(error) {
      console.warn(error);
    }

    return obj;
  }

  set serverEnv(env: object) {
    this.setObj('server', env);
  }

  get serverEnv(): object {
    return this.getObj('server');
  }
}
