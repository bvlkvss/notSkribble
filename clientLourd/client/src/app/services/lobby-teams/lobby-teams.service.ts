import { Injectable } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { ClassicService } from "@app/services/classic/classic.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";

@Injectable({
    providedIn: "root"
})
export class LobbyTeamsService {

    public teamOne: string[] = [];
    public teamTwo: string[] = [];
    public disableVirtual = false;
    public selectedVirtual = -1;
    public haveVirtualPlayer: boolean = false;

    constructor(
        private classicService: ClassicService,
        private currentUserService: CurrentUserService,
        private avatarService: AvatarService
    ) { }

    getPlayer(isTeamOne: boolean, isFirst: boolean): string {
        if (isTeamOne) {
            if (isFirst) {
                return this.teamOne[0];
            }
            else {
                return this.teamOne[1];
            }
        } else {
            if (isFirst) {
                return this.teamTwo[0];
            }
            else {
                return this.teamTwo[1];
            }
        }
    }

    getTotalPlayers(): number {
        return this.teamOne.length + this.teamTwo.length;
    }

    addPlayers(teamOne: string[], teamTwo: string[]): void {
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
    }

    isUserInTeam(team: string[], user: string): boolean {
        for(let member of team) {
            if (member === user) return true;
        }
        return false;
    }

    getUserTeamColor(): string {
        if(this.isUserInTeam(this.teamOne, this.currentUserService.getUser())){
            return "blue";
        } else {
            return "red";
        }
    }

    startGame(): void {
        this.classicService.teamOne = this.teamOne;
        this.classicService.teamTwo = this.teamTwo;
    }

    resetLobby(): void {
        this.teamOne = [];
        this.teamTwo = [];
        this.avatarService.resetAvatar();
    }

    getUserTeam(): string[] {
        if(this.isUserInTeam(this.teamOne, this.currentUserService.getUser())){
            return this.teamOne;
        } else {
            return this.teamTwo;
        }
    }

    setVirtualOnJoin(): void {
        let team = this.getUserTeam();
        if(team.length !== 2){
            this.haveVirtualPlayer = false;
            this.disableVirtual = false;
        } else if(this.isTeamHaveVirtual(team)){
            this.haveVirtualPlayer = true;
            this.disableVirtual = true;
        } else {
            this.haveVirtualPlayer = false;
            this.disableVirtual = true;
            this.selectedVirtual = -1;
        }
    }

    isTeamHaveVirtual(team: string[]): boolean {
        return team[0].startsWith("[VIRT]") || team[1].startsWith("[VIRT]");
    }

}
