import { Component, OnInit } from '@angular/core';
import { pluralize, titleize } from 'inflected';

@Component({
  selector: 'app-users-all',
  templateUrl: './users-all.page.html',
  styleUrls: ['./users-all.page.scss'],
})
export class UsersAllPage implements OnInit {
  public klass = "user";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  constructor() { }

  ngOnInit() {
  }

}
