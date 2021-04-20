import { Injectable } from "@angular/core";
import { Connection } from "@app/classes/connection";
import { Game } from "@app/classes/game";
const DATESTRING = " - ";
const TIMESTRING = ":";
@Injectable({
    providedIn: "root"
})
export class CurrentUserService {

    private theme: string = localStorage.getItem("theme") || "light-theme";
    private themeBack: string = localStorage.getItem("themeBack") || "light-theme-back";
    private themeTitle: string = localStorage.getItem("themeTitle") || "light-theme-title";

    public username: string;
    public firstName: string;
    public lastName: string;
    public nGamesPlayed: number;
    public percentageWins: number;
    public averageTimeGame: number[] = [];
    public totalTimeplaying: number[] = [];
    public bestScoreSolo: number;
    public connections: Connection[] = [];
    public historyGames: Game[] = [];
    public lastConnectionTime: any;
    public lastConnectionDate: any;
    constructor() {
    }

    setUserInfo(firstName: string, lastName: string, nGamesPlayed: number, percentageWins: number, averageTimeGame: any, totalTimeplaying: any, bestScoreSolo: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nGamesPlayed = nGamesPlayed;
        this.percentageWins = percentageWins;
        this.averageTimeGame = this.convertStatsTime(averageTimeGame);
        this.totalTimeplaying = this.convertStatsTime(totalTimeplaying);
        this.bestScoreSolo = bestScoreSolo;
    }

    private convertStatsTime(data: any): number[] {
        let array: number[] = [];
        array.push(data.days);
        array.push(data.hours);
        array.push(data.minutes);
        array.push(data.seconds);
        return array;
    }

    isNoGamePlayed(): boolean {
        return this.historyGames.length === 0;
    }

    addGames(data: any): void {
        this.historyGames = [];
        for (let game of data) {
            this.historyGames.push(this.dataToGame(game));
        }
    }

    addConnection(connections: any, deconnections: any): void {
        this.connections = [];
        for (let i = 0; i < deconnections.length; i++) {
            this.connections.push(this.dataToConnection(connections[i], deconnections[i]));
        }
        this.lastConnectionTime = connections[connections.length - 1].time;
        this.lastConnectionDate = connections[connections.length - 1].date;
        let data = {
            date: {
                day: "", month: "", year: ""
            }, time: {
                hour: "", minute: "", second: ""
            }
        };
        this.connections.push(this.dataToConnection(connections[connections.length - 1], data));
    }

    private dataToGame(data: any): Game {
        return {
            mode: data.game_mode,
            date: this.convertDateToString(data.timestamp.date),
            time: this.convertTimeToString(data.timestamp.time),
            players: data.players,
            result: data.result
        };
    }

    private dataToConnection(dataConnection: any, dataDeconnection: any): Connection {
        return {
            dateConnection: this.convertDateToString(dataConnection.date),
            timeConnection: this.convertTimeToString(dataConnection.time),
            dateDeconnection: this.convertDateToString(dataDeconnection.date),
            timeDeconnection: this.convertTimeToString(dataDeconnection.time)
        };
    }

    private convertDateToString(data: any): string {
        if(data.day === ""){
            return "";
        }
        return data.day + DATESTRING + data.month + DATESTRING + data.year;
    }

    private convertTimeToString(data: any): string {
        if(data.hour === ""){
            return "";
        }
        return data.hour + TIMESTRING + data.minute + TIMESTRING + data.second;
    }

    public setUser(name: string) {
        this.username = name;
    }
    public removeUser(): void {
        this.username = "";
    }
    public getUser(): string {
        return this.username;
    }

    public getTheme(): string {
        return this.theme;
    }

    public setTheme(theme: string): void {
        this.theme = theme;
    }

    public getThemeBack(): string {
        return this.themeBack;
    }

    public setThemeBack(theme: string): void {
        this.themeBack = theme;
    }

    public getThemeTitle(): string {
        return this.themeTitle;
    }

    public setThemeTitle(theme: string): void {
        this.themeTitle = theme;
    }
}
