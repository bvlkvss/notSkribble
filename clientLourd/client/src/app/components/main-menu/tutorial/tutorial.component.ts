import { Component, OnInit } from "@angular/core";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";

@Component({
    selector: "app-tutorial",
    templateUrl: "./tutorial.component.html",
    styleUrls: ["./tutorial.component.scss"]
})
export class TutorialComponent implements OnInit {

    constructor(
        public tutorialService: TutorialService,
        public windowManagerService: WindowManagerService
    ) { }

    ngOnInit(): void {
    }

    startTutorial(): void {
        this.tutorialService.startTutorial();
    }
}
