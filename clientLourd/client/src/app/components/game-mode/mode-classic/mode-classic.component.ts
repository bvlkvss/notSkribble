import { Component, OnInit } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { ClassicService } from "@app/services/classic/classic.service";

@Component({
    selector: "app-mode-classic",
    templateUrl: "./mode-classic.component.html",
    styleUrls: ["./mode-classic.component.scss"]
})
export class ModeClassicComponent implements OnInit {

    constructor(
        public classicService: ClassicService,
        public avatarService: AvatarService
    ) { }

    ngOnInit(): void {
    }

}
