import { Component, OnInit } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { CoopService } from "@app/services/coop/coop.service";
import { SoloService } from "@app/services/solo/solo.service";

@Component({
    selector: "app-mode-coop",
    templateUrl: "./mode-coop.component.html",
    styleUrls: ["./mode-coop.component.scss"]
})
export class ModeCoopComponent implements OnInit {

    constructor(
        public coopService: CoopService,
        public soloService: SoloService,
        public avatarService: AvatarService
    ) { }

    ngOnInit(): void {
    }

}
