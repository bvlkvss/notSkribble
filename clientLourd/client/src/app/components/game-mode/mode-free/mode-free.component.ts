import { Component, OnInit } from "@angular/core";
import { FreeGameService } from "@app/services/free-game/free-game.service";

@Component({
    selector: "app-mode-free",
    templateUrl: "./mode-free.component.html",
    styleUrls: ["./mode-free.component.scss"]
})
export class ModeFreeComponent implements OnInit {

    constructor(
        public freeGameService: FreeGameService
    ) { }

    ngOnInit(): void {
    }

}
