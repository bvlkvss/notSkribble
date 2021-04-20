import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { RoomMessagesWindowService } from "@app/services/room-messages/room-messages-window/room-messages-window.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-room-message-window",
    templateUrl: "./room-message-window.component.html",
    styleUrls: ["./room-message-window.component.scss"]
})
export class RoomMessageWindowComponent implements OnInit {
    public newMessage: string;

    @ViewChild("textInput") textInput: any;
    constructor(
        private componentManagerService: ComponentManagerService,
        public roomWindowservice: RoomMessagesWindowService,
        private chatWindowManagerService: ChatWindowManagerService,
        private gameManagerService: GameManagerService,
        private classicService: ClassicService,
        private electronService: ElectronService,
        private changeDetector: ChangeDetectorRef,
        private currentUserService: CurrentUserService
    ) { }

    ngOnInit(): void {
        this.electronService.ipcRenderer.on("message-sent", (event, arg) => {
            this.changeDetector.detectChanges();
        });
        this.chatWindowManagerService.sendMessage({ username: this.currentUserService.username, room: this.roomWindowservice.roomName, message: this.newMessage });
        this.chatWindowManagerService.getHistory({ room: this.roomWindowservice.roomName });

        this.electronService.ipcRenderer.on("history", (event, arg) => {
            this.changeDetector.detectChanges();
        });
        this.chatWindowManagerService.getHistory({ room: this.roomWindowservice.roomName });
    }

    public sendMessage(): void {
        if (this.newMessage.trim().length !== 0) {
            this.roomWindowservice.addMessage(this.newMessage);
            this.newMessage = "";
        }
        this.textInput.nativeElement.focus();
    }

    public returnChat(): void {
        this.componentManagerService.setChatComponent(ComponentsDisplay.CONVO);
    }

    public getHistory(): void {
        let data = {
            room: this.roomWindowservice.roomName
        };
        this.chatWindowManagerService.getHistory(data);
    }

    public askHint(): void {
        this.chatWindowManagerService.getHint({ name: this.roomWindowservice.roomName.substring(6) });
    }

    public isPrivateRoom(): boolean {
        if (this.gameManagerService.isClassicOrBlind()) {
            return this.roomWindowservice.roomName.startsWith("[PRIV]") && this.gameManagerService.isVirtualDrawing && this.classicService.isUserInGuessingTeam();
        } else {
            return this.roomWindowservice.roomName.startsWith("[PRIV]");
        }
    }
}
