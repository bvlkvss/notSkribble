import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesWindowService } from "@app/services/room-messages/room-messages-window/room-messages-window.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-convo-window",
    templateUrl: "./convo-window.component.html",
    styleUrls: ["./convo-window.component.scss"]
})
export class ConvoWindowComponent implements OnInit {

    deletingMode: boolean;
    constructor(
        private componentManagerService: ComponentManagerService,
        public convoManagerService: ConvoManagerService,
        private roomMessagesWindowService: RoomMessagesWindowService,
        private chatWindowManagerService: ChatWindowManagerService,
        private electronService: ElectronService,
        private changeDetector: ChangeDetectorRef,
        public currentUserService: CurrentUserService
    ) {
        this.convoManagerService.removePrivateRoom();
    }

    ngOnInit(): void {
        this.deletingMode = false;
        this.electronService.ipcRenderer.on("joined-rooms", (event, arg) => {
            this.changeDetector.detectChanges();
        });
        this.chatWindowManagerService.getJoinedRooms();

        this.electronService.ipcRenderer.on("add-priv", (event, arg) => {
            this.changeDetector.detectChanges();
        });
        this.chatWindowManagerService.getJoinedRooms();
        // this.convoManagerService.addPrivateRoom(arg);
    }

    onClickRoom(name: string): void {
        this.roomMessagesWindowService.roomName = name;
        this.roomMessagesWindowService.getMessages([]);
        this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
        if (name.startsWith("[PRIV]")) {

            let data = {
                room: this.roomMessagesWindowService.roomName
            };
            this.chatWindowManagerService.getHistory(data);
        }
    }

    onClickCheck(name: string): void {
        let checkbox: HTMLInputElement = <HTMLInputElement>document.getElementById(name);
        if ((<HTMLInputElement>document.getElementById(name) as any).checked) {
            checkbox.checked = false;
        } else {
            checkbox.checked = true;
        }
    }

    isGeneral(name: string): boolean {
        if (name === "general") {
            return true;
        }
        return false;
    }

    startDeleting(): void {
        if (this.deletingMode) {
            this.deletingMode = false;
        } else {
            this.deletingMode = true;
        }
    }

    quitRoom(): void {
        this.convoManagerService.getJoinedRooms().forEach(element => {
            if ((<HTMLInputElement>document.getElementById(element) as any).checked) {
                if (element !== "general") {
                    let data = {
                        room: element
                    };
                    this.chatWindowManagerService.quitRoom(data);
                }
            }
        });

        this.startDeleting();
    }
}
