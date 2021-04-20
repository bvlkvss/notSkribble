import { AfterViewInit, Component } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { EffectService } from "@app/services/effect/effect.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { SoloService } from "@app/services/solo/solo.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Component({
    selector: "app-game-mode",
    templateUrl: "./game-mode.component.html",
    styleUrls: ["./game-mode.component.scss"],

})
export class GameModeComponent implements AfterViewInit {
    componentDisplay: typeof ComponentsDisplay = ComponentsDisplay;
    mode: string;

    constructor(
        public componentManagerService: ComponentManagerService,
        public gameManagerService: GameManagerService,
        public currentUserService: CurrentUserService,
        public classicService: ClassicService,
        public soloService: SoloService,
        public effectService: EffectService,
        public tutorialService: TutorialService
    ) {
        if (this.gameManagerService.getTypeGame() === ComponentsDisplay.CLASSIC_GAME) {
            this.gameManagerService.waitUntil();
            if (this.classicService.getIsBlind()) {
                this.mode = "blindMode";
            } else {
                this.mode = "classicMode";
            }
        }
    }

    ngAfterViewInit(): void {
        let canvas = document.getElementById("preview") as HTMLCanvasElement;
        if(canvas !== null){
            let ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas?.width, canvas?.height);
        }
    }


    isArtist(): boolean {
        return this.gameManagerService.artist === this.currentUserService.getUser();
    }

    isFree(): boolean {
        return this.gameManagerService.mode === "free";
    }

    isSolo(): boolean {
        return this.gameManagerService.mode === "solo";
    }

    isClassic(): boolean {
        return this.gameManagerService.mode === "classic";
    }

    isBlind(): boolean {
        return this.gameManagerService.mode === "blind";
    }

    isCoop(): boolean {
        return this.gameManagerService.mode === "coop";
    }

    isVirtual(): boolean {
        return this.gameManagerService.isVirtualDrawing;
    }

    isCanvas(): boolean {
        return this.isSolo() || this.isCoop() || this.isVirtual();
    }

    getDuration(): string {
        let time = this.gameManagerService.duration;
        if (time === undefined || time === null || time.length === 0) {
            return "0";
        } else {
            return time;
        }
    }

    isSVGTwo(): boolean {
        return this.tutorialService.textShow === 6 || this.tutorialService.textShow === 7;
    }

    isText8(): boolean {
        if(this.tutorialService.textShow === 8) {
            clearInterval(this.soloService.interval);
            this.soloService.isGameStart = false;
            return true;
        }
        return false;
    }

    isTransition(): boolean {
        return this.effectService.counter !== 0 && (this.isClassic() || this.isCoop());
    }

    getTeamGuessing(): string {
        if (this.classicService.isTeamOneGuessing) {
            return "blue";
        }
        return "red";
    }
}
