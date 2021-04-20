import { Component, OnInit } from "@angular/core";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { SocketioService } from "@app/services/socketio.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";

@Component({
    selector: "app-profil",
    templateUrl: "./profil.component.html",
    styleUrls: ["./profil.component.scss"]
})
export class ProfilComponent implements OnInit {
    isConnection: boolean = false;
    isGame: boolean = false;
    columnsConnection: string[] = ["dateConnection", "timeConnection", "dateDeconnection", "timeDeconnection"];
    columnsGame: string[] = ["mode", "date", "time", "players", "result"];
    constructor(
        public currentUserService: CurrentUserService,
        public avatarService: AvatarService,
        private socketio: SocketioService,
        public windowManagerService: WindowManagerService
    ) { 
        this.socketio.getStats({});
    }

    ngOnInit(): void {
        this.isConnection = false;
        this.isGame = false;
        this.socketio.getStats({});
    }

}
