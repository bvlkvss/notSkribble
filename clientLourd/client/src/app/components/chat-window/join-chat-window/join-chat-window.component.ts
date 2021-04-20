import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesWindowService } from "@app/services/room-messages/room-messages-window/room-messages-window.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-join-chat-window",
    templateUrl: "./join-chat-window.component.html",
    styleUrls: ["./join-chat-window.component.scss"]
})
export class JoinChatWindowComponent implements OnInit {
    public selectedRoom: string;
    public searchedRoom: string;

  disableSelect = new FormControl(false);
  constructor(
    private componentManagerService: ComponentManagerService,
    public convoManagerService: ConvoManagerService,
    private roomMessagesWindowService: RoomMessagesWindowService,
    private chatWindowManagerService: ChatWindowManagerService,
    public currentUserService: CurrentUserService,
    private electronService: ElectronService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on("available-rooms", (event, arg) => {
      this.changeDetector.detectChanges();
    });
    this.chatWindowManagerService.getAvailableRooms();
  }

    public joinRoom(room: string): void {
        let data = {
            username: "",
            room: room
        };
        this.chatWindowManagerService.joinRoom(data);

        this.roomMessagesWindowService.roomName = room;
        this.roomMessagesWindowService.emptyMessages();
        this.convoManagerService.setActiveTab(0);
        this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
    }

    refresh(): void {
      this.chatWindowManagerService.getAvailableRooms();
  }
}
