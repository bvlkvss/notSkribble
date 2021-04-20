import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import {TutorialService} from "@app/services/tutorial/tutorial.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
import { ElectronService } from "ngx-electron";
@Component({
    selector: "app-main-game-page",
    templateUrl: "./main-game-page.component.html",
    styleUrls: ["./main-game-page.component.scss"]
})
export class MainGamePageComponent implements OnInit {
    componentDisplay: typeof ComponentsDisplay = ComponentsDisplay;
    constructor(
        public componentManagerService: ComponentManagerService,
        public windowManagerService: WindowManagerService,
        public currentUserService: CurrentUserService,
        public tutorialService: TutorialService,
        private electronService: ElectronService,
        private changeDetector : ChangeDetectorRef
    ) {
        this.electronService.ipcRenderer.on("simple-window", (event, arg) => {
            this.changeDetector.detectChanges();
            this.windowManagerService.setIsDetached(false);
            this.windowManagerService.setGamePageWidth(62);
        });
     }

    ngOnInit(): void {
    }

    isSVGTwo(): boolean {
        return this.tutorialService.textShow === 6 || this.tutorialService.textShow === 7;
    }


}
