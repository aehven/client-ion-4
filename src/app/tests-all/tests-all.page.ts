import { Component, OnInit } from '@angular/core';
import { pluralize, titleize } from 'inflected';

@Component({
  selector: 'app-tests-all',
  templateUrl: './tests-all.page.html',
  styleUrls: ['./tests-all.page.scss'],
})
export class TestsAllPage implements OnInit {
  public klass = "test";
  public Klass = titleize(this.klass);
  public klasses = pluralize(this.klass);
  public Klasses = pluralize(this.Klass);

  constructor() { }

  ngOnInit() {
  }

}
