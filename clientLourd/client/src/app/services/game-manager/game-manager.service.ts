import { Injectable } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { GAMESTATUS } from "@app/enum/game-status";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameDialogService } from "@app/services/game-dialog/game-dialog.service";
import { SocketioService } from "@app/services/socketio.service";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Injectable({
    providedIn: "root"
})
export class GameManagerService {
    public duration: string;
    public word: string;
    public artist: string;
    public startTime: Date = new Date("March 21, 2021 16:00:30");
    public endTime: Date = new Date("March 21, 2021 16:02:00");
    public isGuessed: boolean = false;
    public round: number;
    public name: string;
    public nTries: number;
    public isReplyRight: boolean;
    public interval: any;
    public mode: string;
    public isVirtualDrawing: boolean = false;
    private setToolSet: boolean = false;

    constructor(
        public currentUserService: CurrentUserService,
        public pencilService: PencilService,
        private componentManagerService: ComponentManagerService,
        public classicService: ClassicService,
        private socketService: SocketioService,
        private gameDialogService: GameDialogService,
        private toolsManagerService: ToolsManagerService,
        private undoRedoService: UndoRedoService
    ) {
        this.round = 1;
        this.isReplyRight = false;
    }

    resetGame(): void {
        this.word = "";
        this.round = 1;
        this.resetInfo();
        this.artist = "";
        this.duration = "0";
        this.classicService.resetGame();
        clearInterval(this.interval);
        this.componentManagerService.setChatComponent(ComponentsDisplay.CONVO);
    }

    replyRight(endTime: string, startTime: string, tries: number): void {
        this.endTime = new Date(endTime);
        this.startTime = new Date(startTime);
        this.nTries = tries;
    }

    isArtist(): boolean {
        return this.currentUserService.getUser() === this.artist;
    }

    getWordLength(): number {
        return this.word.length;
    }

    getHour(): number {
        let date = new Date();

        let dur;
        if (Math.floor((this.startTime.valueOf() - date.valueOf()) / (1000)) <= 0) {
            dur = (this.endTime.valueOf() - date.valueOf()) / (1000);
            if (!this.setToolSet) {
                this.setAccessToTools(false);
                this.setToolSet = true;
            }
        } else {
            dur = (this.endTime.valueOf() - this.startTime.valueOf()) / (1000);
            this.setAccessToTools(true);
            this.setToolSet = false;
        }
        this.duration = Math.floor(dur).toString();
        return Math.floor(dur);
    }

    async waitUntil() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                if (this.getHour() <= 0 && !this.isGuessed) {
                    clearInterval(this.interval);
                    if (!this.isReplyRight) {
                        this.isReplyRight = true;
                        if (this.isSendSocket()) {
                            this.socketService.replyRight({ name: this.name });
                        }
                    } else {
                        if (this.round !== 4) {
                            this.gameDialogService.openDialog(GAMESTATUS.ROUND_DONE, "", this.classicService.word);
                        }
                        this.nextRound();
                    }
                } else if (this.isGuessed && this.isSendSocket()) {
                    clearInterval(this.interval);
                    this.resetInfo();
                    this.nextRound();
                }
            }, 1000);
        });
    }

    isSendSocket(): boolean {
        if (this.classicService.isUserDrawing) {
            return true;
        } else if (this.isVirtualDrawing && this.name === this.currentUserService.getUser()) {
            return true;
        } else {
            return false;
        }
    }

    nextRound(): void {
        if (this.isSendSocket()) {
            if (this.round + 1 > 4) {
                this.endGame();
            } else {
                let data = {
                    name: this.name
                };
                this.socketService.nextRound(data);
                this.resetInfo();
            }
        }
    }

    endGame(): void {
        this.socketService.endGame({ name: this.name });
    }

    resetInfo(): void {
        if (this.isVirtualDrawing) {
            let canvas = document.getElementById("preview") as HTMLCanvasElement;
            let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas?.width, canvas?.height);
        } else {
            this.pencilService.clearCanvas();
            this.undoRedoService.ClearRedo();
            this.undoRedoService.ClearUndo();
        }
        this.isGuessed = false;
        this.isReplyRight = false;
    }

    newRound(artist: string, endTime: string, startTime: string, word: string, tries: number, teamOnePts: number, teamTwoPts: number,): void {
        this.resetInfo();
        if (artist !== undefined) {
            if (artist.startsWith("[VIRT]")) {
                this.isVirtualDrawing = true;
            } else {
                this.isVirtualDrawing = false;
            }
        }
        ++this.round;
        this.setRoundData(artist, endTime, startTime, word, tries);
        this.classicService.updateScore(teamOnePts, teamTwoPts);
        this.waitUntil();
    }

    startRound(artist: string, endTime: string, startTime: string, word: string, tries: number): void {
        if (artist !== undefined) {
            if (artist.startsWith("[VIRT]")) {
                this.isVirtualDrawing = true;
            } else {
                this.isVirtualDrawing = false;
            }
        }
        this.classicService.nameGame = this.name;
        this.setRoundData(artist, endTime, startTime, word, tries);
        this.toolsManagerService.setTools("pencil");
        this.componentManagerService.setGameComponent(ComponentsDisplay.CLASSIC_GAME);
    }

    private setRoundData(artist: string, endTime: string, startTime: string, word: string, tries: number): void {
        this.artist = artist;
        this.classicService.isUserDrawing = this.isArtist();
        this.endTime = new Date(endTime);
        this.startTime = new Date(startTime);
        this.setTriesWord(tries, word);
        this.classicService.word = word;
    }

    setAccessToTools(isWaiting: boolean): void {
        if (this.isArtist() && !isWaiting) {
            this.toolsManagerService.setTools("pencil");
        } else {
            this.toolsManagerService.setTools("");
        }
    }

    startFreeGame(): void {
        this.artist = this.currentUserService.getUser();
        this.name = this.artist;
        this.setAccessToTools(false);
    }

    startSoloGame(): void {
        this.artist = this.currentUserService.getUser();
        this.toolsManagerService.setTools("pencil");
        this.name = this.currentUserService.getUser();
    }

    getTypeGame(): string {
        return this.componentManagerService.currentGameComponent;
    }

    setTriesWord(tries: number, word: string): void {
        this.nTries = tries;
        this.word = word;
    }

    isClassicOrBlind(): boolean {
        return this.mode === "classic" || this.mode === "blind";
    }

    isSoloOrCoop(): boolean {
        return this.mode === "solo" || this.mode === "coop";
    }
}
