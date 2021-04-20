import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";

@Injectable({
  providedIn: "root"
})
export class WindowManagerService {

  private isDetached: boolean;
  private lobbyPageWidth: number = 60.5;
  private gamePageWidth: number = 62;
  private transitionWidth: number = 64;

  constructor(
    private electronService: ElectronService
  ) {
    this.isDetached = false;
    
  }

  resizeWindow(): void {
    this.electronService.ipcRenderer.send("resize-game-window");
  }

  getIsDetached(): boolean {
    return this.isDetached;
  }

  setIsDetached(bool: boolean): void {
    this.isDetached = bool;
  }

  getGamePageWidth(): number {
    return this.gamePageWidth;
  }

  setGamePageWidth(width: number): void {
    this.gamePageWidth = width;
  }

  getTransitionWidth(): number {
    return this.transitionWidth;
  }

  setTransitionWidth(width: number): void {
    this.transitionWidth = width;
  }

  getLobbyPageWidth(): number {
    return this.lobbyPageWidth;
  }

  setLobbyPageWidth(width: number): void {
    this.lobbyPageWidth = width;
  }
}
