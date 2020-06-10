import { Component, OnInit } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  public klass = "notification";
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
                  'title' : [null, Validators.required],
                  'text' : [null, Validators.required],
                  'level' : ["Warning"],
                  'expires_at' : [null],
                  'in_app' : [true],
                  'email' : [null],
                  'sms' : [null],
                  'action' : [null],
                  'href' : [null],
                });
              }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];

      if(this.id == "new") {
        this.enableForm();
        this.gotIt = false;
      }
      else {
        this.disableForm(false);
        this.get();
      }
    });
  }

  async get() {
    this.gotIt = false;
    const resp = await this.dataService.show(`${this.klass}`, + this.id);
    this.form.patchValue(resp['data']);
    this.gotIt = true;
  }

  async submitForm(form) {
    try {
      this.errorMessage = null;
      const response = await this.dataService.send(this.klass, this.id, form.value);
      this.id = response['data']['id'];
      this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
    }
    catch(error) {
      this.errorMessage = error.statusText;
    }
  }

  async delete(event) {
    if(confirm("Are you sure?")) {
      await this.dataService.delete(this.klass, this.id);
      this.router.navigate([`/${pluralize(this.klass)}`], {queryParams: {reload: true}});
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
