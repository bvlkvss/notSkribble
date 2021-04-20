import { Component, OnInit } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { CoopService } from "@app/services/coop/coop.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";

@Component({
    selector: "app-lobby-coop",
    templateUrl: "./lobby-coop.component.html",
    styleUrls: ["./lobby-coop.component.scss"]
})
export class LobbyCoopComponent implements OnInit {

    constructor(
        public coopService: CoopService,
        public avatarService: AvatarService,
        public windowManagerService: WindowManagerService
    ) { 
    }

    ngOnInit(): void {
    }

}
