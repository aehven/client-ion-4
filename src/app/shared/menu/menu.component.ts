import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  constructor(private menuController: MenuController, public sessionService: SessionService) { }

  ngOnInit() {}

  menuClicked() {
    this.menuController.close();
  }
}
