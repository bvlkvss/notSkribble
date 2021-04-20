import { Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { SocketioService } from "@app/services/socketio.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit {

    constructor(
        public currentUserService: CurrentUserService,
        public componentManagerService: ComponentManagerService,
        public convoManagerService: ConvoManagerService,
        private socketio: SocketioService,
        public windowManagerService: WindowManagerService,
        public tutorialService: TutorialService
    ) {
    }

    ngOnInit(): void {
    }

    afficherConvo(): boolean {
        return (this.componentManagerService.chatComponent === ComponentsDisplay.CONVO);
    }

    afficherRoomMessages(): boolean {
        return (this.componentManagerService.chatComponent === ComponentsDisplay.ROOM_MESSAGES);
    }

    updateRooms(): void {
        let data = {};
        this.socketio.getAvailableChatrooms(data);
    }

    detachChatWindow(): void {
        this.windowManagerService.setIsDetached(true);
        this.windowManagerService.resizeWindow();
    }
}
