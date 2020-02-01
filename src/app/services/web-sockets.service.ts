import { environment } from '../../environments/environment';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import { ActionCableService, Cable, Channel } from 'angular2-actioncable';

@Injectable({
  providedIn: 'root'
})
export class WebSocketsService implements OnDestroy {
  private cable: Cable = null;
  private channels = {};

  constructor(private cableService: ActionCableService) { }

  initialize(user: any): void {
    this.destroy();
    if(user.email && user.jwt) {
      console.log("webSocketsService initialize", user.email, user.jwt);
      this.cable = this.cableService.cable(`${environment.webSocketPath}`,
        {
          uid: user.email,
          jwt: user.jwt
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    console.log("websocket destroy");
    for(let channel in this.channels) {
      this.channels[channel].unsubscribe();
    }

    this.cableService.disconnect(`${environment.webSocketPath}`);

    this.cable = null;
    this.channels = {};
  }

  getChannel(channelName: string, params: any): Channel {
    let channelId = this.getChannelId(channelName, params);

    if(this.cable && !this.channels[channelId]) {
      console.log(`New Channel ID for ${channelName} / ${JSON.stringify(params)}: ${channelId}`);
      this.channels[channelId] = this.cable.channel(channelName, params);
    }

    return this.channels[channelId];
  }

  connect(channelName: string, params: any): Observable<any> {
    let channel = this.getChannel(channelName, params)
    if(channel) {
      return channel.received();
    }
    else {
      return null;
    }
  }

  disconnect(channelName: string, params: any): void {
    let channelId = this.getChannelId(channelName, params);

    this.channels[channelId].unsubscribe();
  }

  getChannelId(channelName: string, params: any): string {
    return channelName + JSON.stringify(params);
  }
}
