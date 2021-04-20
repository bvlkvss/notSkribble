import { Injectable } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { SocketioService } from "@app/services/socketio.service";

@Injectable({
    providedIn: "root"
})
export class CoopService {
    public team: string[] = [];
    constructor(
        private currentUserService: CurrentUserService,
        private gameManagerService: GameManagerService,
        private socketio: SocketioService,
        private avatarService: AvatarService
    ) { }

    addPlayer(name: string): void {
        if(this.team.length !== 4){
            this.team.push(name);
        }
    }

    resetCoopGame(): void {
        this.team = [];
        this.avatarService.resetAvatar();
    }

    isMinimumPlayers(): boolean {
        return this.team.length >= 2;
    }

    isUser(): boolean {
        return this.currentUserService.getUser() === this.gameManagerService.name;
    }

    startCoopGame(): void {
        if(this.isUser()){
            this.socketio.startGameRoom({name: this.gameManagerService.name});
        }
    }

    isNumberPlayers(player: number): boolean {
        return this.team.length >= player;
    }
}
