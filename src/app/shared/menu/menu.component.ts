import { environment } from '../../../environments/environment';
import { Component, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { pluralize, titleize } from 'inflected';

import { SessionService } from '../../services/session.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements AfterViewInit {
  public usersBelongToOrganizations = environment.usersBelongToOrganizations;
  public aOrganizationIsCalled = "organization";

  constructor(private menuController: MenuController, 
    public storage: StorageService,
    public sessionService: SessionService) { }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        this.aOrganizationIsCalled = pluralize(titleize(this.storage?.serverEnv?.["BTSTC_ORGANIZATION_IS_CALLED"]));
      }
      finally {}
    }, 1000);
  }

  menuClicked() {
    this.menuController.close();
  }

  toggleDark() {
    document.body.classList.toggle('dark');
  }
}
