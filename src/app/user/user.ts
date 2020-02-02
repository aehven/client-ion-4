export class User {
  id: any;
  email: any;
  first_name: any;
  last_name: any;
  role: any;
  address: any;
  phone: any;
  tac_agreed_at: Date;
  percent_change: number;
  minileague_id: number;
  permissions: any;
  wst: string;
  customer_id: number;
  jwt: string;

  constructor(values: Object = {}) {
    this.mergeValues(values);
  }

  mergeValues(values: Object = {}) {
    Object.assign(this, values);
  }
  can(action: string, subject: string) {
    if(this._can(action, subject) && !this._cannot(action, subject)) {
      return true;
    }
    else {
      return false;
    }
  }

  _can(action: string, subject: string) {
    let res = false
    if(this.permissions) {
      if(this.permissions.includes(`can.${action}.${subject}`) ||
        this.permissions.includes(`can.${action}.all`) ||
        this.permissions.includes(`can.manage.${subject}`) ||
        this.permissions.includes(`can.manage.all`)) {
          res = true;
        }
    }

    // console.log(`_can ${action} ${subject}: ${res}`);

    return res;
  }

  _cannot(action: string, subject: string): boolean {
    let res = true;

    if(this.permissions) {
      if(this.permissions.includes(`cannot.${action}.${subject}`)) {
        res = true;
      }
      else {
        res = false;
      }
    }

    // console.log(`_cannot ${action} ${subject}: ${res}`);

    return res;
  }
}
