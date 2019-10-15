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
      'email' : null,
      'password': null
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

  submitForm(form: FormGroup): void {
    this.sessionService.signIn({
        login:    form.value.email.trim(),
        password: form.value.password.trim()
    }).subscribe(
      res =>      {
        this.storage.serverEnv = res.body.data.server;
        this.sessionService.goHome();
      },
      error => {
        if(error.status == 401) {
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
    );
  }

  eraseErrors(): void {
    this.invalidCreds = false;
    this.form.controls['email'].setErrors(null);
    this.form.controls['password'].setErrors(null);
    this.unknownError = false;
  }
}
