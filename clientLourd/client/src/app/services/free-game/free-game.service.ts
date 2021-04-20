import { Injectable } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { SocketioService } from "@app/services/socketio.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Injectable({
    providedIn: "root"
})
export class FreeGameService {

    constructor(
        private gameManagerService: GameManagerService,
        private componentManagerService: ComponentManagerService,
        private socketIo: SocketioService,
        private pencilService: PencilService,
        private undoRedoService: UndoRedoService,
    ) { }

    startFreeGame(diff: string, lang: string): void {
        this.gameManagerService.startFreeGame();
        let data = {
            name: this.gameManagerService.name,
            difficulty: diff,
            type: "free",
            lang: lang
        };
        this.socketIo.createGameRoom(data);
        this.socketIo.startGameRoom({name: this.gameManagerService.name});
        this.socketIo.getNextWord({name: this.gameManagerService.name});
    }

    nextWord(): void {
        this.pencilService.clearCanvas();
        this.undoRedoService.ClearRedo();
        this.undoRedoService.ClearUndo();
        this.socketIo.getNextWord({name: this.gameManagerService.name});
    }

    endGame(): void {
        this.gameManagerService.endGame();
        this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
    }

    setNextWord(word: string): void {
        this.gameManagerService.word = word;
    }
}
