import { Injectable } from "@angular/core";
import { CurrentUserService } from "@app/services/current-user/current-user.service";

@Injectable({
    providedIn: "root"
})
export class ClassicService {
    public teamOne: string[] = [];
    public teamTwo: string[] = [];
    public score: number[] = [0, 0];
    public nameGame: string;
    public isUserDrawing: boolean;
    public word: string;
    private isBlind: boolean;
    public isTeamOneGuessing: boolean;
    public userTeam: string = "";

    constructor(
        private currentUserService: CurrentUserService
    ) { 
    }

    getUserTeamColor(): string {
        if(this.isUserInTeam(this.teamOne, this.currentUserService.getUser())){
            return "blue";
        } else {
            return "red";
        }
    }

    updateScore(teamOne: number, teamTwo: number): void {
        this.score[0] = teamOne;
        this.score[1] = teamTwo;
    }

    resetGame(): void {
        this.teamOne = [];
        this.teamTwo = [];
        this.score = [0,0];
        this.nameGame = "";
        this.word = "";
    }

    getIsBlind(): boolean {
        return this.isBlind;
    }

    setIsBlind(bool: boolean): void {
        this.isBlind = bool;
    }

    isUserInGuessingTeam(): boolean {
        if(this.isTeamOneGuessing && this.isUserInTeam(this.teamOne, this.currentUserService.username)){
            return true;
        } else if(!this.isTeamOneGuessing && this.isUserInTeam(this.teamTwo, this.currentUserService.username)){
            return true;
        } else {
            return false;
        }
    }

    private isUserInTeam(team: string[], user: string): boolean {
        for(let player of team){
            if(player === user) return true;
        }
        return false;
    }

    setGuessingTeam(artist: string): void {
        if(this.isUserInTeam(this.teamOne, artist)){
            this.isTeamOneGuessing = true;
        } else {
            this.isTeamOneGuessing = false;
        }
    }
}
