import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GameDialogComponent } from "@app/components/game-mode/game-dialog/game-dialog.component";
import { ComponentsDisplay } from "@app/enum/components";
import { GAMESTATUS } from "@app/enum/game-status";
import { Text } from "@app/enum/text";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";

@Injectable({
    providedIn: "root"
})
export class GameDialogService {

    constructor(
        public dialog: MatDialog,
        private componentManagerService: ComponentManagerService,
        private convoManagerService: ConvoManagerService,
        private roomMessageService: RoomMessagesService
    ) { }

    openDialog(type: GAMESTATUS, winner: string, word: string): void {
        let message = [];
        let timeout = 4000;
        switch (type) {
            case GAMESTATUS.ANSWER_RIGHT:
                message.push(Text.WORD_GUESSED);
                message.push(Text.CORRECT_WORD);
                message.push(Text.ROUND_DONE);
                break;
            case GAMESTATUS.REPLY:
                message.push(Text.REPLY);
                break;
            case GAMESTATUS.ROUND_DONE:
                message.push(Text.CORRECT_WORD);
                message.push(Text.ROUND_DONE);
                break;
            case GAMESTATUS.END_GAME:
                message.push(Text.END_GAME);
                timeout = 10000;
                if (winner === "equal") {
                    message.push(Text.NO_WINNER);
                } else {
                    message.push(Text.WINNER);
                }
                break;
            case GAMESTATUS.DECONNECTED_USER:
                message.push(Text.DISCONNECT_USER);
                timeout = 10000;
                break;
            case GAMESTATUS.END_SOLO_COOP:
                message.push(Text.END_SOLO_COOP);
                break;
            default:
                break;
        }
        const dialogRef = this.dialog.open(GameDialogComponent, {
            data: { message: message, word: word, winner: winner }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (type === GAMESTATUS.END_GAME || type === GAMESTATUS.DECONNECTED_USER) {
                this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
                if (this.roomMessageService.roomName.startsWith("[PRIV]")) {
                    this.convoManagerService.setActiveTab(0);
                }
            }
        });

        dialogRef.afterOpened().subscribe(_ => {
            setTimeout(() => {
                dialogRef.close();
            }, timeout);
        });

    }
}
