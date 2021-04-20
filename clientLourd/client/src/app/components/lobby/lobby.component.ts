import { Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CoopService } from "@app/services/coop/coop.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { SocketioService } from "@app/services/socketio.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";

@Component({
    selector: "app-lobby",
    templateUrl: "./lobby.component.html",
    styleUrls: ["./lobby.component.scss"]
})
export class LobbyComponent implements OnInit {
    componentDisplay: typeof ComponentsDisplay = ComponentsDisplay;

    constructor(
        public componentManagerService: ComponentManagerService,
        public gameManagerService: GameManagerService,
        private socketio: SocketioService,
        private coopService: CoopService,
        private convoManagerService: ConvoManagerService,
        public windowManagerService: WindowManagerService
    ) {
    }

    ngOnInit(): void {
    }

    isClassic(): boolean {
        return this.gameManagerService.mode === "classic";
    }
    isBlind(): boolean {
        return this.gameManagerService.mode === "blind";
    }

    isCoop(): boolean {
        return this.gameManagerService.mode === "coop";
    }
    onStartGame(): void {

        switch (this.componentManagerService.currentGameComponent) {
            case ComponentsDisplay.CLASSIC_LOBBY:
                this.componentManagerService.setGameComponent(ComponentsDisplay.CLASSIC_GAME);
                break;
            case ComponentsDisplay.COOP_LOBBY:
                this.componentManagerService.setGameComponent(ComponentsDisplay.COOP_GAME);
                break;
            case ComponentsDisplay.BLIND_LOBBY:
                this.componentManagerService.setGameComponent(ComponentsDisplay.BLIND_GAME);
                break;
        }
    }

    returnLobby(): void {
        this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
        let data = {};
        this.socketio.leaveLobby(data);
        this.convoManagerService.removePrivateRoom();
        this.gameManagerService.resetGame();
        this.coopService.resetCoopGame();
    }
}
