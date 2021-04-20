import { Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Component({
    selector: "app-convo",
    templateUrl: "./convo.component.html",
    styleUrls: ["./convo.component.scss"]
})
export class ConvoComponent implements OnInit {

    deletingMode: boolean;
    constructor(
        private componentManagerService: ComponentManagerService,
        public convoManagerService: ConvoManagerService,
        private roomMessagesService: RoomMessagesService,
        private socketioService: SocketioService,
        public currentUserService: CurrentUserService,
        private tutorialService: TutorialService
    ) {
        this.convoManagerService.removePrivateRoom();
    }

    ngOnInit(): void {
        this.deletingMode = false;
        let data = {};
        this.socketioService.getJoinedChatrooms(data);
    }

    onClickRoom(name: string): void {
        if(this.tutorialService.isTutorial && name.startsWith("[PRIV]")){
            this.tutorialService.actionDone = true;
        }
        this.roomMessagesService.roomName = name;
        this.roomMessagesService.getMessages([]);
        this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
        if (name.startsWith("[PRIV]")) {
            let data = {
                room: this.roomMessagesService.roomName
            };
            this.socketioService.getHistory(data);
        }
        this.roomMessagesService.getMessageSinceConnection();
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
                    this.socketioService.leaveRoom(data);
                }
            } 
        });

        this.startDeleting();
    }

    isGameRoom(name: string): boolean {
        return name.startsWith("[PRIV]");
    }
}
