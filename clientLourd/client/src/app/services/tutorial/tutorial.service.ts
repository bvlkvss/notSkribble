import { Injectable } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { SocketioService } from "@app/services/socketio.service";
import { CurrentUserService } from "../current-user/current-user.service";
import { WindowManagerService } from "../window-manager/window-manager.service";

@Injectable({
    providedIn: "root"
})
export class TutorialService {
    isTutorial: boolean;
    textShow: number;
    actionDone: boolean = false;
    interval: any;
    activeTab: number;

    constructor(
        private componentManager: ComponentManagerService,
        private socketioService: SocketioService,
        private convoManagerService: ConvoManagerService,
        private gameManagerService: GameManagerService,
        private currentUserService: CurrentUserService,
        private windowManagerService: WindowManagerService
    ) { }

    setActiveTab(tab: number): void {
        this.activeTab = tab;
    }

    startTutorial(): void {
        this.gameManagerService.artist = this.currentUserService.username;
        this.gameManagerService.mode = "tuto";
        this.isTutorial = true;
        this.actionDone = false;
        this.activeTab = 0;
        this.componentManager.setComponent(ComponentsDisplay.MAINGAMEPAGE);
        this.textShow = 0;
        this.waitUntil();
    }

    setGameModeOption(): string[] {
        return ["solo"];
    }

    disableTutorialButton(): boolean {
        return this.isTutorial || this.windowManagerService.getIsDetached();
    }

    getTextShow(): string {
        return "" + this.textShow;
    }

    async waitUntil() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                if (this.actionDone) {
                    if (this.textShow === 8) {
                        this.convoManagerService.removePrivateRoom();
                        this.endTutoGame();
                        this.textShow++;
                        this.actionDone = false;
                    } else if (this.textShow === 9) {
                        clearInterval(this.interval);
                        this.isTutorial = false;
                        this.textShow = -1;
                    } else {
                        this.textShow++;
                        this.actionDone = false;
                    }
                }
            }, 500);
        });
    }

    setActionDone(step: number): void {
        if (this.textShow === step) {
            this.actionDone = true;
        }
    }

    endTutoGame(): void {
        this.socketioService.endGame({ name: this.gameManagerService.name });
        this.gameManagerService.name = "";
        this.componentManager.setGameComponent(ComponentsDisplay.MENUPAGE);
        this.componentManager.setChatComponent(ComponentsDisplay.CONVO);
        this.convoManagerService.setActiveTab(0);
    }

    stopTutorial(): void {
        clearInterval(this.interval);
        this.textShow = -1;
        this.actionDone = false;
        if(this.gameManagerService.name !== ""){
            this.endTutoGame();
        }
        this.isTutorial = false;
        this.setActiveTab(0);
    }
}
