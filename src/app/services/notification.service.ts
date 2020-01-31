import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { DataService } from './data.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(public toastController: ToastController,
    public storage: StorageService,
    public dataService: DataService
  ) {}

  async show(notification: any, dissmissCallback: Function = null) {
    console.log(`notification: ${JSON.stringify(notification)}`);

    const toast = await this.toastController.create({
      message: notification['text'],
      duration: notification.duration*1000,
      buttons: [
        {
          side: 'end',
          text: notification['action'] || "OK",
          handler: () => {
            if(notification['id']) {
              let resp = this.dataService.post(`users/${this.storage.getObj("currentUser")['id']}/acknowledge_notification`, {notification_id: notification['id']});
              resp.subscribe(data => {
                console.log("acknowledged", data);
              })
            }
          }
        }
      ]
    });

    toast.present();

    toast.onDidDismiss().then(() => {console.log("didDismiss"); dissmissCallback()});
  }
}
