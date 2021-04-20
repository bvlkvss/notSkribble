import { Injectable } from "@angular/core";
import { Const } from "@app/classes/constants";
import { ComponentsDisplay } from "@app/enum/components";
import { GAMESTATUS } from "@app/enum/game-status";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameDialogService } from "@app/services/game-dialog/game-dialog.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { PreviewService } from "@app/services/preview/preview.service";
import { SocketioService } from "@app/services/socketio.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Injectable({
    providedIn: "root"
})
export class SoloService {

    public playerName: string = "";
    public totalWords: number = 0;
    public score: number = 0;
    public interval: any;
    public isGameStart: boolean;

    constructor(
        private gameManagerService: GameManagerService,
        private socketIo: SocketioService,
        private componentManagerService: ComponentManagerService,
        private currentUserService: CurrentUserService,
        private previewService: PreviewService,
        private tutorialService: TutorialService,
        private gameDialogService: GameDialogService
    ) {
        this.isGameStart = false;
    }

    resetGame(): void {
        this.score = 0;
        this.totalWords = 0;
    }

    setWord(word: string): void {
        this.gameManagerService.word = word;
    }

    startSoloGame(diff: string, lang: string): void {
        this.resetGame();
        this.gameManagerService.startSoloGame();
        this.playerName = this.gameManagerService.name;
        let data = {
            name: this.gameManagerService.name,
            difficulty: diff,
            type: "solo",
            lang: lang
        };
        this.socketIo.createGameRoom(data);
        this.gameManagerService.artist = "";
        this.gameManagerService.isGuessed = false;
    }
    
    startSoloTutorial(): void {
        this.resetGame();
        this.playerName = this.gameManagerService.name;
        this.gameManagerService.startSoloGame();
        this.gameManagerService.artist = "";
        this.gameManagerService.isGuessed = false;
    }

    setTime(startTime: string, endTime: string): void {
        this.gameManagerService.endTime = new Date(endTime);
        this.gameManagerService.startTime = new Date(startTime);
    }

    setValueBeforeGame(): void {
        this.resetGame();
        this.gameManagerService.artist = "";
        this.gameManagerService.isGuessed = false;
        this.gameManagerService.nTries = 0;
        this.gameManagerService.word = "";
    }

    newRound(nTries: number, word: string): void {
        this.previewService.resetPreviewCanvas();
        this.gameManagerService.artist = "";
        this.gameManagerService.isGuessed = false;
        this.gameManagerService.nTries = nTries;
        this.gameManagerService.word = word;
        this.totalWords++;
    }

    endGame(): void {
        this.socketIo.endGame({name: this.playerName});
        this.gameDialogService.openDialog(GAMESTATUS.END_SOLO_COOP, "", "");
        this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
        this.isGameStart = false;
        this.resetGame();
        this.playerName = "";
        clearInterval(this.interval);
    }

    startGameRoom(): void {
        this.isGameStart = true;
        if(this.tutorialService.isTutorial){
            this.tutorialService.actionDone = true;
            this.resetGame();
            this.newRound(6, "orange");
            let date = new Date();
            this.setTime(date.toString(), date.toString());
            this.addTime(240);
            this.drawTutorial();
            this.timeTutorial();
        } else {
            this.socketIo.startGameRoom({ name: this.gameManagerService.name });
        }
    }

    async timeTutorial() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                this.isGameStart = false;
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                if (this.gameManagerService.getHour() <= 0) {
                    this.endGame();
                    this.isGameStart = false;
                    clearInterval(this.interval);
                }
            }, 1000);
        });
    }

    drawTutorial(): void {
        this.gameManagerService.isVirtualDrawing = true;
        this.previewService.setValues(Const.ORANGE.type, Const.ORANGE.lines, Const.ORANGE.background, Const.ORANGE.line_color, 120);
    }

    addTime(seconds: number): void {
        this.gameManagerService.endTime.setSeconds(this.gameManagerService.endTime.getSeconds() + seconds);
    }

    async startTimerSolo() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                if (this.gameManagerService.getHour() <= 0) {
                    if (this.currentUserService.getUser() === this.gameManagerService.name) {
                        this.socketIo.endGame({ name: this.gameManagerService.name });
                    }
                    this.endGame();
                    this.isGameStart = false;
                    clearInterval(this.interval);
                }
            }, 1000);
        });
    }

}
