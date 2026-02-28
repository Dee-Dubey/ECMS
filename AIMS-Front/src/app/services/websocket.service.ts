import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {
  Observable

} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: io.Socket; // Declaring Socket

  hostAddress: string = 'http://localhost:3010';

  constructor() {
    // this.socket = io.connect(this.hostAddress);
    this.socket = io.connect('http://localhost:3010');
    // console.log('socket io link', window.location.host)
  }

  /**
   * Listens for a specific event from the connected WebSocket (Socket.IO).
   *
   * @param {string} eventName - The name of the socket event to listen for.
   * @returns {Observable<any>} - An observable that emits data whenever the specified event occurs.
   *
   * This method allows components or services to subscribe to real-time socket events.
   * Each time the server emits the specified event, the received data is passed to the subscriber.
   */
  listen(eventName: string): Observable<any> {
    return new Observable((subscribe) => {
      this.socket.on(eventName, (data) => {
        subscribe.next(data);
      })
    })
  }


  /**
   * Emits (sends) data to a specific WebSocket (Socket.IO) event.
   *
   * @param {string} eventName - The name of the event to emit through the socket.
   * @param {any} data - The payload or data to send along with the event.
   *
   * This method is used to send data from the client to the server (or other connected clients)
   * via a specific event name. The server should have a corresponding listener for the same event.
   */
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

}
