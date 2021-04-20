import { Component, OnInit } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { SoloService } from "@app/services/solo/solo.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

@Component({
    selector: "app-mode-solo",
    templateUrl: "./mode-solo.component.html",
    styleUrls: ["./mode-solo.component.scss"]
})
export class ModeSoloComponent implements OnInit {

    constructor(
        public soloService: SoloService,
        public avatarService: AvatarService,
        private tutorialService: TutorialService
    ) { 
        this.soloService.setValueBeforeGame();
    }

    ngOnInit(): void {
    }

    soloTutoDisable(): boolean {
        return this.tutorialService.textShow === 4;
    }
}
