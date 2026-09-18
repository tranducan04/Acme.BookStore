import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '@abp/ng.core';
import { OAuthService } from 'angular-oauth2-oidc';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessageDto } from '../../proxy/chats/models';

@Injectable({
  providedIn: 'root',
})
export class ChatSignalRService {
  private environmentService = inject(EnvironmentService);
  private oAuthService = inject(OAuthService);

  private hubConnection: signalR.HubConnection | null = null;
  private messageReceivedSource = new BehaviorSubject<ChatMessageDto | null>(null);

  public messageReceived$: Observable<ChatMessageDto | null> = this.messageReceivedSource.asObservable();

  public async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const baseUrl = this.environmentService.getEnvironment().apis.default.url;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/signalr-hubs/chat`, {
        accessTokenFactory: () => this.oAuthService.getAccessToken() || '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      console.log('SignalR ReceiveMessage event:', message);
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
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn('SignalR is not connected, attempting to connect before sending...');
      await this.startConnection();
    }

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('Invoking SendMessageAsync with receiverId:', receiverId, 'message:', message);
      await this.hubConnection.invoke('SendMessageAsync', receiverId, message);
      console.log('SendMessageAsync invoked successfully.');
    } else {
      console.error('SignalR is still not connected.');
      throw new Error('SignalR chưa được kết nối.');
    }
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
}
