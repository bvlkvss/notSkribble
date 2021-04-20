import { Component } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CoopService } from "@app/services/coop/coop.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { FreeGameService } from "@app/services/free-game/free-game.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { LobbyTeamsService } from "@app/services/lobby-teams/lobby-teams.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { SoloService } from "@app/services/solo/solo.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-common-page",
    templateUrl: "./common-page.component.html",
    styleUrls: ["./common-page.component.scss"],
})
export class CommonPageComponent {
    componentType: typeof ComponentsDisplay = ComponentsDisplay;

    constructor(
        public componentManagerService: ComponentManagerService,
        public currentUserService: CurrentUserService,
        public roomMessagesService : RoomMessagesService,
        private socketio: SocketioService,
        private convoManagerService: ConvoManagerService,
        private gameManagerService: GameManagerService,
        private lobbyTeamsService: LobbyTeamsService,
        private coopService: CoopService,
        private soloService: SoloService,
        public tutorialService: TutorialService,
        private electronService: ElectronService,
        private freeGameService: FreeGameService

    ) {
    }

    deconnectUser(): void {
        let data = {
            username: this.currentUserService.getUser()
        };
        this.currentUserService.removeUser();
        this.roomMessagesService.emptyMessages();
        this.electronService.ipcRenderer.send("merge-window");
        this.tutorialService.stopTutorial();
        this.convoManagerService.setActiveTab(0);
        this.socketio.disconnect(data);
    }

    leaveGame(): void {
        if (this.componentManagerService.currentGameComponent === ComponentsDisplay.FREE_GAME) {
            this.freeGameService.endGame();
        }

        this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
        let data = {};
        this.soloService.isGameStart = false;
        this.socketio.leaveLobby(data);
        this.convoManagerService.removePrivateRoom();
        this.gameManagerService.resetGame();
        this.lobbyTeamsService.resetLobby();
        this.coopService.resetCoopGame();
        clearInterval(this.gameManagerService.interval);
        clearInterval(this.soloService.interval);
    }
}
