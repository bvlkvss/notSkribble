import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ComponentsDisplay } from "@app/enum/components";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CoopService } from "@app/services/coop/coop.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { FreeGameService } from "@app/services/free-game/free-game.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { JoinRoomService } from "@app/services/join-room/join-room.service";
import { LobbyTeamsService } from "@app/services/lobby-teams/lobby-teams.service";
import { SocketioService } from "@app/services/socketio.service";
import { SoloService } from "@app/services/solo/solo.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-main-menu",
    templateUrl: "./main-menu.component.html",
    styleUrls: ["./main-menu.component.scss"]
})
export class MainMenuComponent implements OnInit {
    public isJoinGameDisplay: boolean;
    public gameOptionForm: FormGroup;
    public gameMode: string[] = ["classic", "solo", "coop", "blind", "free"];
    gameControl = new FormControl("", [Validators.required]);
    diffControl = new FormControl("", [Validators.required]);
    langControl = new FormControl("", [Validators.required]);

    constructor(
        private formBuilder: FormBuilder,
        private componentManagerService: ComponentManagerService,
        private socketIo: SocketioService,
        public currentUserService: CurrentUserService,
        private gameManagerService: GameManagerService,
        public classicService: ClassicService,
        private convoManagerService: ConvoManagerService,
        private freeGameService: FreeGameService,
        private soloService: SoloService,
        private lobbyTeamsService: LobbyTeamsService,
        public coopService: CoopService,
        private joinRoomService: JoinRoomService,
        public tutorialService: TutorialService,
        private electronService: ElectronService,
        public windowManagerService: WindowManagerService
    ) {
        this.createGameOptionForm();
        this.isJoinGameDisplay = false;
        if (this.tutorialService.isTutorial) {
            this.gameMode = this.tutorialService.setGameModeOption();
        }
        this.gameControl.setValue("classic");
        this.diffControl.setValue("easy");
        this.langControl.setValue("fr");
    }

    ngOnInit(): void {
    }

    private createGameOptionForm(): void {
        this.gameOptionForm = this.formBuilder.group({
            gameMode: this.gameControl,
            difficulty: this.diffControl,
            language: this.langControl
        });
    }

    isSoloGameMode(): boolean {
        if (this.gameControl.value === "free"
            || this.gameControl.value === "solo") {
            return true;
        } else {
            return false;
        }
    }

    onJoin(): void {
        this.coopService.resetCoopGame();
        this.gameManagerService.mode = this.gameOptionForm.get("gameMode")?.value;
        let data = {
            difficulty: this.diffControl.value,
            type: this.gameOptionForm.get("gameMode")?.value,
            lang: this.langControl.value
        };
        if (data.type === "blind") {
            this.classicService.setIsBlind(true);
        }
        this.joinRoomService.data = data;
        this.socketIo.getGameRoom(data);
        this.componentManagerService.setGameComponent(ComponentsDisplay.JOIN_GAME);
    }

    onCreateGame(): void {
        let data;
        this.classicService.setIsBlind(false);
        switch (this.gameControl.value) {
            case "classic":
                this.gameManagerService.mode = "classic";
                this.gameManagerService.name = this.currentUserService.getUser();
                data = {
                    name: this.gameManagerService.name,
                    difficulty: this.diffControl.value,
                    type: "classic",
                    lang: this.langControl.value
                };
                this.socketIo.createGameRoom(data);
                this.classicService.nameGame = this.gameManagerService.name;
                this.classicService.setIsBlind(false);
                this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                this.componentManagerService.setGameComponent(ComponentsDisplay.CLASSIC_LOBBY);
                this.lobbyTeamsService.haveVirtualPlayer = false;
                this.lobbyTeamsService.disableVirtual = false;
                break;

            case "solo":
                this.gameManagerService.mode = "solo";
                this.gameManagerService.name = this.currentUserService.getUser();
                this.componentManagerService.setGameComponent(ComponentsDisplay.SOLO_GAME);
                if (this.tutorialService.isTutorial) {
                    this.tutorialService.setActionDone(3);
                    this.soloService.startSoloTutorial();
                    data = {
                        name: this.gameManagerService.name,
                        difficulty: this.diffControl.value,
                        type: "tuto",
                        lang: this.langControl.value
                    };    
                    this.socketIo.createGameRoom(data);
                    this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                    this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                } else {
                    this.soloService.startSoloGame(this.diffControl.value, this.langControl.value);
                    this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                    this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                }
                break;

            case "coop":
                this.coopService.resetCoopGame();
                this.gameManagerService.mode = "coop";
                this.gameManagerService.name = this.currentUserService.getUser();
                data = {
                    name: this.gameManagerService.name,
                    difficulty: this.diffControl.value,
                    type: "coop",
                    lang: this.langControl.value
                };
                this.socketIo.createGameRoom(data);
                this.gameManagerService.artist = "";
                this.componentManagerService.setGameComponent(ComponentsDisplay.COOP_LOBBY);
                this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                break;

            case "blind":
                this.gameManagerService.mode = "blind";
                this.gameManagerService.name = this.currentUserService.getUser();
                data = {
                    name: this.gameManagerService.name,
                    difficulty: this.diffControl.value,
                    type: "blind",
                    lang: this.langControl.value
                };
                this.socketIo.createGameRoom(data);
                this.classicService.nameGame = this.gameManagerService.name;
                this.classicService.setIsBlind(true);
                this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                this.componentManagerService.setGameComponent(ComponentsDisplay.CLASSIC_LOBBY);
                break;

            case "free":
                this.gameManagerService.mode = "free";
                this.gameManagerService.isVirtualDrawing = false;
                this.gameManagerService.artist = this.currentUserService.username;
                this.componentManagerService.setGameComponent(ComponentsDisplay.FREE_GAME);
                this.freeGameService.startFreeGame(this.diffControl.value, this.langControl.value);
                break;
        }
        if (this.tutorialService.isTutorial) {
            this.gameMode = ["classic", "solo", "coop", "blind", "free"];
        }
    }

    showSvgOne(): boolean {
        return this.tutorialService.textShow === 0 || this.tutorialService.textShow === 1 || this.tutorialService.textShow === 2 || this.tutorialService.textShow === 3;
    }

    showSvgTwo(): boolean {
        return this.tutorialService.textShow === 9;
    }

}
