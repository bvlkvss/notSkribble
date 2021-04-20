import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { LobbyTeamsService } from "@app/services/lobby-teams/lobby-teams.service";
import { SocketioService } from "@app/services/socketio.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";


@Component({
    selector: "app-lobby-teams",
    templateUrl: "./lobby-teams.component.html",
    styleUrls: ["./lobby-teams.component.scss"],
    animations: [
        trigger("transitionState", [
            state("show", style({
                opacity: 1
            })),
            state("hide", style({
                opacity: 0
            })),
            transition("show => hide", animate("600ms ease-out")),
            transition("hide => show", animate("1000ms ease-in"))
        ])
    ]
})
export class LobbyTeamsComponent implements OnInit {

    show: boolean = false;
    constructor(
        public lobbyTeamsService: LobbyTeamsService,
        public componentManagerService: ComponentManagerService,
        private socketService: SocketioService,
        private currentUserService: CurrentUserService,
        private gameManagerService: GameManagerService,
        public classicService: ClassicService,
        public avatarService: AvatarService,
        private socketio: SocketioService,
        private convoManagerService: ConvoManagerService,
        public windowManagerService: WindowManagerService
    ) {
        this.lobbyTeamsService.selectedVirtual = -1;
    }

    onChange(value: number): void {
        if (value === this.lobbyTeamsService.selectedVirtual) {
            this.lobbyTeamsService.selectedVirtual = -1;
        } else {
            this.lobbyTeamsService.selectedVirtual = value;
        }
    }

    addPlayer(): void {
        let type = this.getTypeVirtualPlayer();
        if(type.length > 0){
            let data = {
                name: this.gameManagerService.name,
                type: type,
                team: this.lobbyTeamsService.getUserTeamColor()
            };
            this.socketService.addVirtualplayer(data);
            this.lobbyTeamsService.disableVirtual = true;
            this.lobbyTeamsService.haveVirtualPlayer = true;
        }
    }

    removePlayer(): void {
        let data = {
            name: this.gameManagerService.name,
            team: this.lobbyTeamsService.getUserTeamColor()
        };
        this.socketService.removeVirtualPlayer(data);
        this.lobbyTeamsService.haveVirtualPlayer = false;
        this.lobbyTeamsService.disableVirtual = false;
    }

    getTypeVirtualPlayer(): string {
        switch (this.lobbyTeamsService.selectedVirtual) {
            case 1:
                return "nice";
            case 2:
                return "rude";
            case 3:
                return "arrogant";
            default:
                return "";
        }
    }

    ngOnInit(): void {
    }

    isDisabled(): boolean {
        return this.lobbyTeamsService.getTotalPlayers() < 4 || this.gameManagerService.name !== this.currentUserService.getUser();
    }

    getStateName(): string {
        return this.show ? "show" : "hide";
    }

    startGame(): void {
        this.socketService.startGameRoom({ name: this.currentUserService.getUser() });
    }

    showImage(isFirstTeam: boolean, isFirst: boolean): boolean {
        let img = this.avatarService.getAvatarClassic(isFirstTeam, isFirst);
        if (img === undefined || img === null || img.length === 0) {
            return false;
        } else {
            return true;
        }
    }

    returnLobby(): void {
        this.componentManagerService.setGameComponent(ComponentsDisplay.MENUPAGE);
        let data = {};
        this.socketio.leaveLobby(data);
        this.convoManagerService.removePrivateRoom();
        this.gameManagerService.resetGame();
        this.lobbyTeamsService.resetLobby();
    }
}
