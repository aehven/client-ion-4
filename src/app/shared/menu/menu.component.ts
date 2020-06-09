import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { SessionService } from '../../services/session.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public usersBelongToCustomers = environment.usersBelongToCustomers;
  public aCustomerIsCalled = "customer";

  constructor(private menuController: MenuController, 
    public storage: StorageService,
    public sessionService: SessionService) { }

  ngOnInit() {
    try {
      this.aCustomerIsCalled = pluralize(titleize(this.storage.serverEnv["BTSTC_CUSTOMER_IS_CALLED"]));
    }
    catch( _ ) {}
  }

  menuClicked() {
    this.menuController.close();
  }

  toggleDark() {
    document.body.classList.toggle('dark');
  }
}
