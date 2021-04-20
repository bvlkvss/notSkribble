import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Component({
    selector: "app-join-chat",
    templateUrl: "./join-chat.component.html",
    styleUrls: ["./join-chat.component.scss"]
})
export class JoinChatComponent implements OnInit {
    public selectedRoom: string;
    public searchedRoom: string;

    disableSelect = new FormControl(false);
    constructor(
        private socketio: SocketioService,
        public currentUserService: CurrentUserService,
        private componentManagerService: ComponentManagerService,
        public convoManagerService: ConvoManagerService,
        private roomMessagesService: RoomMessagesService,
        public tutorialService: TutorialService
    ) { }

    ngOnInit(): void {
        let data = {};
        this.socketio.getAvailableChatrooms(data);
    }

    public joinRoom(room: string): void {
        let data = {
            username: this.currentUserService.getUser(),
            room: room
        };
        this.socketio.joinRoom(data);

        this.roomMessagesService.roomName = room;
        this.roomMessagesService.emptyMessages();
        this.convoManagerService.setActiveTab(0);
        this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
    }

    refresh(): void {
        let data = {};
        this.socketio.getAvailableChatrooms(data);
    }
}
