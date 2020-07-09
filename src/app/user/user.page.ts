import { environment } from '../../environments/environment';
import { stringify } from '../util/stringify';

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

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
  public organizations;
  public userOrganization;
  public usersBelongToOrganizations = environment.usersBelongToOrganizations;

  constructor(public dataService: DataService,
              public route: ActivatedRoute,
              public router: Router,
              public location: Location,
              public sessionService: SessionService,
              private apollo: Apollo,
              public storage: StorageService,
              fb: FormBuilder) {
                this.form = fb.group({
                  'id': [null],
                  'firstName' : [null, Validators.required],
                  'lastName' : [null, Validators.required],
                  'organizationId' : [this.sessionService.currentUser.organization_id],
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
    });

    this.get();
  }

  async get() {
    const query = gql`
      query user {
        user(id: ${this.id}) {
          id
          firstName
          lastName
          email
          role
          permissions
          organizations {
            id
            name
          }
        }
      }`;

    const resp = await this.apollo.query({query: query}).toPromise();

    this.role = resp.data['user']['role'];
    this.form.patchValue(resp.data['user']);
    this.organizations = resp.data['user']['organizations'];
  }

  async submitForm(form: any) {
    var cleanForm = Object.assign({}, form.value);
    delete cleanForm['confirmPassword'];

    const mutation = gql`
      mutation user {
        user(input: ${stringify(cleanForm)}) {
          id
          firstName
          lastName
          email
          role
          organizations {
            id
            name
          }
        }
      }`;

    const resp = await this.apollo.mutate({mutation: mutation}).toPromise();
    
    this.id = resp.data['user']['id'];
    //   this.location.back();
  }

  async delete(event: any) {
    if(confirm("Are you sure?")) {
      await this.dataService.delete(this.klass, this.id);
      this.location.back();
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

  async downloadData() {
    const res = await this.dataService.get(`/users/${this.id}/download_data`);
    console.log(res);
    let blob = new Blob([JSON.stringify(res, null, 4)], { type: 'text/plain' });
    saveAs(blob, "MyData.txt");
  }

   organizationChanged(event: any):void {
     this.userOrganization = event.value;
     if(this.userOrganization > 0) {
       this.form.controls['role'].setValue("regular");
     }
     console.log("organization changed", this.userOrganization);
   }
}
