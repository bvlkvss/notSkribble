import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";

@Injectable({
  providedIn: "root"
})
export class ChatWindowManagerService {

  constructor(private electronService: ElectronService) { }


  mergeWindow():void {
    this.electronService.ipcRenderer.send("merge-window");
  }

  getAvailableRooms(): void {
    this.electronService.ipcRenderer.send("get-all-rooms");
  }

  getJoinedRooms(): void {
    this.electronService.ipcRenderer.send("get-joined-rooms");
  }

  quitRoom(data: any): void {
    this.electronService.ipcRenderer.send("quit-room", data);
  }

  joinRoom(data: any): void {
    this.electronService.ipcRenderer.send("join-room", data);
  }

  sendMessage(data: any): void {
    this.electronService.ipcRenderer.send("send-message", data);
  }

  getHistory(data: any): void {
    this.electronService.ipcRenderer.send("get-history", data);
  }

  getHint(data: any): void {
    this.electronService.ipcRenderer.send("get-hint", data);
  }
}
