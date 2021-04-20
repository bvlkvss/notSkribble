import { Injectable } from "@angular/core";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";

@Injectable({
    providedIn: "root"
})
export class EffectService {

    counter: number;
    interval: any;
    show: boolean = false;

    constructor(
        private gameManagerService: GameManagerService
    ) {
    }

    public playAudio(): void {
        let audio = new Audio();
        audio.src = "./assets/music/correct_answer.mp3";
        audio.load();
        audio.play();
    }

    startTimer():void {
        this.counter = 3;
        this.show = true;
    }

    getShow(): boolean {
        if (this.counter === 0) {
            return false;
        }
        return this.show;
    }

    getCounter(): number {
        return this.counter;
    }

    async startCountDown() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                let date = new Date();
                if (Math.floor((this.gameManagerService.startTime.valueOf() - date.valueOf()) / (1000)) <= 3) {
                    this.counter--;
                }
                if (this.counter === 0) {
                    clearInterval(this.interval);
                }
            }, 1000);
        });
    }

}
