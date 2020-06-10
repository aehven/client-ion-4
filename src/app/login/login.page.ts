import { environment } from '../../environments/environment';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { DataService } from '../services/data.service';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form : FormGroup;
  invalidCreds : boolean = false;
  unknownError : boolean = false;

  constructor(public sessionService: SessionService,
              fb: FormBuilder,
              public router: Router,
              public route: ActivatedRoute,
              public storage: StorageService,
              public dataService: DataService) {
    this.form = fb.group({
      'email' : "admin@null.com",
      'password': "password"
    })
  }

  ngOnInit() {
    // if(this.sessionService.isLoggedIn) {
    //   this.sessionService.goHome();
    // }
    if(environment.allowAnonymousUsers) {
      this.route.queryParams.subscribe(params => {
        if(params["anonymous"]) {
          this.sessionService.anonymousSignIn();
        }
      })
    }
  }

  async submitForm(form: FormGroup) {
    try {
      const resp = await this.sessionService.signIn({
        email:    form.value.email.trim(),
        password: form.value.password.trim()
      });
      this.sessionService.goHome();
    }
    catch(error) {
      if(error.status == 401 || error.status == 404) {
        this.invalidCreds = true;
        this.form.controls['email'].setErrors({'incorrect': true});
        this.form.controls['password'].setErrors({'incorrect': true});
        this.unknownError = false;
      }
      else {
        this.invalidCreds = false;
        this.form.controls['email'].setErrors(null);
        this.form.controls['password'].setErrors(null);
        this.unknownError = true;
      }
      console.log(error)
    }
  }

  eraseErrors(): void {
    this.invalidCreds = false;
    this.form.controls['email'].setErrors(null);
    this.form.controls['password'].setErrors(null);
    this.unknownError = false;
  }
}
