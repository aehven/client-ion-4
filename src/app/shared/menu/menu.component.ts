import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public usersBelongToCustomers = environment.usersBelongToCustomers;

  constructor(private menuController: MenuController, public sessionService: SessionService) { }

  ngOnInit() {}

  menuClicked() {
    this.menuController.close();
  }

  toggleDark() {
    document.body.classList.toggle('dark');
  }
}
