import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

import { pluralize, titleize } from 'inflected';

import { SessionService } from '../services/session.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {
  public klass = "test";
  public Klass = titleize(this.klass);

  public gotIt: boolean = false;
  public form : FormGroup;
  public isReadOnly: boolean = true;
  public id;
  public errorMessage;
  public tests;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public location: Location,
              public sessionService: SessionService,
              private apollo: Apollo,
              public storage: StorageService,
              fb: FormBuilder) {
                this.form = fb.group({
                  'name' : [null, Validators.required],
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
    const query = gql`
      query {
        test(id: ${this.id}) {
          id
          name
        }
      }
    `;

    const resp = await this.apollo.query({query: query}).toPromise();

    this.form.patchValue(resp['data']['test']);
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
