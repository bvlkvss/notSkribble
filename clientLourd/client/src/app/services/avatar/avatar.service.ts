import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class AvatarService {

    teamOneAvatar: string[];
    teamTwoAvatar: string[];
    teamCoopAvatar: string[];
    userAvatar: string;

    constructor() {
    }

    resetAvatar(): void {
        this.teamCoopAvatar = [];
        this.teamOneAvatar = [];
        this.teamTwoAvatar = [];
    }

    setTeamAvatarClassic(teamOne: number[], teamTwo: number[]): void {
        this.teamOneAvatar = [];
        for (let player of teamOne) {
            this.teamOneAvatar.push(this.getAvatarSource(player));
        }
        this.teamTwoAvatar = [];
        for (let player of teamTwo) {
            this.teamTwoAvatar.push(this.getAvatarSource(player));
        }
    }

    setTeamCoop(team: number[]): void {
        this.teamCoopAvatar = [];
        for (let player of team) {
            this.teamCoopAvatar.push(this.getAvatarSource(player));
        }
    }

    setAvatar(avatar: number): void {
        this.userAvatar = this.getAvatarSource(avatar);
    }

    getAvatarClassic(isTeamOne: boolean, isFirst: boolean): string {
        if (isTeamOne) {
            if (isFirst) {
                return this.teamOneAvatar[0];
            }
            else {
                return this.teamOneAvatar[1];
            }
        } else {
            if (isFirst) {
                return this.teamTwoAvatar[0];
            }
            else {
                return this.teamTwoAvatar[1];
            }
        }
    }

    getAvatarCoop(player: number): string {
        return this.teamCoopAvatar[player];
    }

    getUserAvatar(): string {
        return this.userAvatar;
    }

    getAvatarSource(avatar: number): string {
        switch (avatar) {
            case 1:
                return "assets/icons/1.png";
            case 2:
                return "assets/icons/2.png";
            case 3:
                return "assets/icons/3.png";
            case 4:
                return "assets/icons/4.png";
            case 5:
                return "assets/icons/5.png";
            case 6:
                return "assets/icons/6.png";
            case 7:
                return "assets/icons/7.png";
            case 8:
                return "assets/icons/8.png";
            case 9:
                return "assets/icons/9.png";
            case 10:
                return "assets/icons/10.png";
            case 11:
                return "assets/icons/11.png";

            default:
                return "";
        }
    }
}
