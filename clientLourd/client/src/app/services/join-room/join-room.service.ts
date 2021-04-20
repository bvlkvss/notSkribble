import { Injectable } from "@angular/core";
import { Room } from "@app/classes/room";

@Injectable({
    providedIn: "root"
})
export class JoinRoomService {

    constructor() { }
    public joinRooms: Room[] = [];
    public data: any;

    public getGameRooms(data: any): void {
        this.joinRooms = data;
    }

    addRoom(room: Room): void {
        this.joinRooms.push(room);
    }

}
