import { Component, OnInit } from "@angular/core";
import { Room } from "@app/classes/room";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { JoinRoomService } from "@app/services/join-room/join-room.service";
import { SocketioService } from "@app/services/socketio.service";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-join-game",
    templateUrl: "./join-game.component.html",
    styleUrls: ["./join-game.component.scss"]
})
export class JoinGameComponent implements OnInit {

    public rooms: Room[] = [];
    selectedRoom: Room;
    space: string = "  ";

    constructor(
        private socketio: SocketioService,
        private componentMangerService: ComponentManagerService,
        public joinRoomService: JoinRoomService,
        private gameManagerService: GameManagerService,
        private convoManagerService: ConvoManagerService,
        public currentUserService: CurrentUserService,
        private electronService: ElectronService
    ) {
    }

    ngOnInit(): void {
    }

    startGame(): void {
        if (this.selectedRoom.name !== undefined) {
            this.gameManagerService.name = this.selectedRoom.name;
            let data = {
                name: this.selectedRoom.name
            };
            this.socketio.joinLobby(data);
            this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
            this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
            this.joinRoomService.joinRooms = [];
            this.componentMangerService.setGameComponent(ComponentsDisplay.CLASSIC_LOBBY);
        }
    }

    joinRoom(roomName: string): void {
        this.gameManagerService.name = roomName;
        let data = {
            name: roomName
        };
        this.socketio.joinLobby(data);
    }

    onChange(event: any) {
        this.selectedRoom = event.value;
    }

    back(): void {
        this.componentMangerService.setGameComponent(ComponentsDisplay.MENUPAGE);
    }

    roomNotFull(room: any): boolean {
        if (room.users.length >= 4) {
            return false;
        }
        return true;
    }

    refresh(): void {
        this.socketio.getGameRoom(this.joinRoomService.data);
    }

}
