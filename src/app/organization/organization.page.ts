import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import { pluralize, titleize } from 'inflected';

import { DataService } from '../services/data.service';
import { SessionService } from '../services/session.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.page.html',
  styleUrls: ['./organization.page.scss'],
})
export class OrganizationPage implements OnInit {
  public klass = "organization";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public form : FormGroup;
  public isReadOnly: boolean = true;
  public id;
  public errorMessage;
  public organizations;

  constructor(public dataService: DataService,
              public route: ActivatedRoute,
              public router: Router,
              public location: Location,
              public sessionService: SessionService,
              public storage: StorageService,
              fb: FormBuilder) {
                this.form = fb.group({
                  'parent_id' : [this.sessionService.currentUser.organization_id],
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
        this.getOrganizations();
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
    if(this.form.controls['parent_id'].value != null || this.sessionService.currentUser.role == 'admin') {
      this.getOrganizations();
    }
    else {
      this.gotIt = true;
    }
  }

  async getOrganizations() {
    const resp = await this.dataService.index("organizations", {names_and_ids_only: true});
    this.organizations = resp['data'].filter(c => parseInt(c[0]) != parseInt(this.id));
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
      await this.dataService.delete(this.klass, this.id)
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
    this.errorMessage = null;
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
