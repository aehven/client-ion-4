import { environment } from '../../environments/environment';

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import { pluralize, titleize } from 'inflected';
import { saveAs } from 'file-saver';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';
import { MyValidators } from '../validators/my-validators';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  public klass = "user";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public form : FormGroup;
  public isReadOnly: boolean = true;
  public ownProfile: boolean = true;
  public id: any;
  public role: string;
  public errorMessage: string;
  public customers;
  public userCustomer;
  public usersBelongToCustomers = environment.usersBelongToCustomers;

  constructor(public dataService: DataService,
              public route: ActivatedRoute,
              public router: Router,
              public location: Location,
              public sessionService: SessionService,
              public storage: StorageService,
              fb: FormBuilder) {
                this.form = fb.group({
                  'first_name' : [null, Validators.required],
                  'last_name' : [null, Validators.required],
                  'customer_id' : [this.sessionService.currentUser.customer_id],
                  'email' :  [null, [Validators.required]],
                  'role': ['regular'],
                  'password' : '',
                  'confirmPassword': ''
                },
                {validator: MyValidators.matchingPasswords('password', 'confirmPassword')});
              }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      if(this.id == this.sessionService.currentUser['id']) {
        this.ownProfile = true;
      }
      else {
        this.ownProfile = false;
      }

      if(this.id == "new" || this.ownProfile) {
        this.enableForm();
      }
      else {
        this.disableForm(false);
      }

      if(this.id == "new") {
        this.gotIt = false;
        this.getCustomers();
      }
      else {
        this.gotIt = false
        this.get();
      }
    });
  }

  get():void {
    this.dataService.show(`${this.klass}`, + this.id)
    .subscribe( resp => {
      this.role = resp['data']['role'];
      this.form.patchValue(resp['data']);
      this.getCustomers();
    });
  }

  getCustomers(): void {
    if(this.usersBelongToCustomers && this.sessionService.currentUser.can('index', 'Customer')) {
      this.dataService.index("customers").subscribe(data => {
        this.customers = data.customers;
        this.gotIt = true;
      })
    }
    else {
      this.gotIt = true;
    }
  }

  submitForm(form: any): void {
    let response = null;

    response = this.dataService.send(this.klass, this.id, form.value);

    response.subscribe(
      res =>  {
        this.id = res['id'];
        if(this.ownProfile) {
          this.location.back();
        }
        else {
          this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
        }
      },
      error => {
        this.errorMessage = error.error.message;
      }
    );
  }

  delete(event: any): void {
    if(confirm("Are you sure?")) {
      this.dataService.delete(this.klass, this.id)
      .subscribe(
        res => {
          this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
        });
    }
    else {
      event.preventDefault(); //stay here
    }
  }

  enableForm(): void {
    this.isReadOnly = false;
    this.form.enable();
  }

  disableForm(reset=true): void {
    this.isReadOnly = true;
    if(reset) {
      this.get();
    }
    this.form.disable();
  }

  cancel(): void {
    this.gotIt = false;
    if(this.id == "new") {
      this.location.back();
    }
    else {
      this.disableForm();
      this.gotIt = true;
    }
  }

  downloadData(): void {
    this.dataService.get(`/users/${this.id}/download_data`).subscribe(
       res => {
         console.log(res);
         let blob = new Blob([JSON.stringify(res, null, 4)], { type: 'text/plain' });
         saveAs(blob, "MyData.txt");
       }
     )
   }

   customerChanged(event: any):void {
     this.userCustomer = event.value;
     if(this.userCustomer > 0) {
       this.form.controls['role'].setValue("regular");
     }
     console.log("customer changed", this.userCustomer);
   }
}
