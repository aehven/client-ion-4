import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {
  public klass = "customer";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public form : FormGroup;
  public isReadOnly: boolean = true;
  public id;
  public errorMessage;
  public customers;

  constructor(public dataService: DataService,
              public route: ActivatedRoute,
              public router: Router,
              public location: Location,
              public sessionService: SessionService,
              fb: FormBuilder) {
                this.form = fb.group({
                  'parent_id' : [this.sessionService.currentUser.customer_id],
                  'name' : [null, Validators.required],
                  'address1' : [null, Validators.required],
                  'address2' :  [null]
                });
              }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];

      if(this.id == "new") {
        this.enableForm();
        this.gotIt = false;
        this.getCustomers();
      }
      else {
        this.disableForm(false);
        this.get();
      }
    });
  }

  get():void {
    this.gotIt = false;
    this.dataService.show(`${this.klass}`, + this.id)
    .subscribe( resp => {
      this.form.patchValue(resp['data']);
      if(this.form.controls['parent_id'].value != null || this.sessionService.currentUser.role == 'admin') {
        this.getCustomers();
      }
      else {
        this.gotIt = true;
      }
    });
  }

  getCustomers(): void {
    this.dataService.index("customers", {names_and_ids_only: true}).subscribe(resp => {
      this.customers = resp['data'].filter(c => parseInt(c[0]) != parseInt(this.id));
      this.gotIt = true;
    })
  }

  submitForm(form): void {
    let response = null;

    response = this.dataService.send(this.klass, this.id, form.value);

    response.subscribe(
      res =>  {
        this.id = res['id'];
        this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
      },
      error => {
        this.errorMessage = error.error.message;
      }
    );
  }

  delete(event): void {
    if(confirm("Are you sure?")) {
      this.dataService.delete(this.klass, this.id)
      .subscribe(
        _ => {
          this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
        });
    }
    else {
      event.preventDefault(); //stay where we are
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
      this.gotIt = true;
      this.disableForm();
    }
  }
}
