import { Component, OnInit, ViewChild } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { SoloService } from "@app/services/solo/solo.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Component({
    selector: "app-room-message",
    templateUrl: "./room-message.component.html",
    styleUrls: ["./room-message.component.scss"]
})
export class RoomMessageComponent implements OnInit {
    public newMessage: string;

    @ViewChild("textInput") textInput: any;
    constructor(
        private componentManagerService: ComponentManagerService,
        public roomservice: RoomMessagesService,
        private socketioService: SocketioService,
        private gameManagerService: GameManagerService,
        private classicService: ClassicService,
        private tutorialService: TutorialService,
        private soloService: SoloService
    ) { }

    ngOnInit(): void {
    }

    checkMessageTuto(): void {
        if(this.tutorialService.isTutorial && this.newMessage.toLowerCase() === "orange") {
            this.tutorialService.actionDone = true;
            this.soloService.score++;
        }
    }

    public sendMessage(): void {
        this.checkMessageTuto();
        if(this.newMessage.trim().length !== 0){
            this.roomservice.addMessage(this.newMessage); 
            this.newMessage = "";
        }
        this.textInput.nativeElement.focus();
    }

    public returnChat(): void {
        this.componentManagerService.setChatComponent(ComponentsDisplay.CONVO);

    }

    public getHistory(): void {
        let data = {
            room: this.roomservice.roomName
        };
        this.socketioService.getHistory(data);
    }

    public askHint(): void {
        this.socketioService.askHint({name: this.gameManagerService.name});
    }

    public isPrivateRoom(): boolean {
        if(this.gameManagerService.isClassicOrBlind()){
            return this.roomservice.roomName.startsWith("[PRIV]") && this.gameManagerService.isVirtualDrawing && this.classicService.isUserInGuessingTeam();
        } else {
            return this.roomservice.roomName.startsWith("[PRIV]") && this.soloService.isGameStart;
        }
    }
}
