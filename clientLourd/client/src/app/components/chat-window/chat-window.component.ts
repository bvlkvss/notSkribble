import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";
import { TranslateService } from "@ngx-translate/core";
import { ElectronService } from "ngx-electron";

@Component({
  selector: "app-chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"]
})
export class ChatWindowComponent implements OnInit {

  constructor(
    public currentUserService: CurrentUserService,
    public componentManagerService: ComponentManagerService,
    public convoManagerService: ConvoManagerService,
    public chatWindowManagerService: ChatWindowManagerService,
    private electronService: ElectronService,
    private translateService: TranslateService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on("option-change", (event, arg) => {
      this.changeDetector.detectChanges();
    });
    this.currentUserService.setTheme(localStorage.getItem("theme") || "light-theme");
    this.translateService.use(localStorage.getItem("lang") || "fr");
  }

  afficherConvo(): boolean {
    return (this.componentManagerService.chatComponent === ComponentsDisplay.CONVO);
  }

  afficherRoomMessages(): boolean {
    return (this.componentManagerService.chatComponent === ComponentsDisplay.ROOM_MESSAGES);
  }

  updateRooms(): void {
    this.chatWindowManagerService.getAvailableRooms();
  }

  detachChatWindow(): void {
    this.chatWindowManagerService.mergeWindow();
  }

}