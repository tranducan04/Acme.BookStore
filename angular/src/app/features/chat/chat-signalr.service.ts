import { Injectable, inject } from '@angular/core';
import { EnvironmentService, ConfigStateService } from '@abp/ng.core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessageDto } from '../../proxy/chats/models';

@Injectable({
  providedIn: 'root',
})
export class ChatSignalRService {
  private environmentService = inject(EnvironmentService);
  private configState = inject(ConfigStateService);

  private hubConnection: signalR.HubConnection | null = null;
  private messageReceivedSource = new BehaviorSubject<ChatMessageDto | null>(null);

  public messageReceived$: Observable<ChatMessageDto | null> = this.messageReceivedSource.asObservable();

  public async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const baseUrl = this.environmentService.getEnvironment().apis.default.url;
    const token = this.configState.getDeep('auth.accessToken');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/signalr-hubs/chat`, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      this.messageReceivedSource.next(message);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR Chat Hub Connected.');
    } catch (err) {
      console.error('Error while starting SignalR connection: ', err);
    }
  }

  public async sendMessage(receiverId: string, message: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendMessageAsync', receiverId, message);
    } else {
      console.error('SignalR is not connected.');
    }
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
}
