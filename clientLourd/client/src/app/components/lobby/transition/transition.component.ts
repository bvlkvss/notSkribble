import { state, style, trigger } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { EffectService } from "@app/services/effect/effect.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";


@Component({
    selector: "app-transition",
    templateUrl: "./transition.component.html",
    styleUrls: ["./transition.component.scss"],
    animations: [
        trigger("transitionState", [
            state("show", style({
                opacity: 1
            })),
            state("hide", style({
                opacity: 1
            })),
        ])
    ]
})
export class TransitionComponent implements OnInit {

    show: boolean = false;

    constructor(
        public effectService: EffectService,
        public windowManagerService: WindowManagerService
    ) {
    }

    ngOnInit(): void {
    }

    getStateName(): string {
        return this.effectService.getShow() ? "show" : "hide";
    }
}
