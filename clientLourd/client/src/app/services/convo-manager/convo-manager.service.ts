import { Injectable } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";

@Injectable({
    providedIn: "root"
})
export class ConvoManagerService {

    private joinedRooms: Set<string>;
    private availableRooms: Set<string>;
    private activeTab: number;
    private privateRooms: string;

    constructor(
        private socketioService: SocketioService,
        private roomMessagesService: RoomMessagesService,
        private componentManagerService: ComponentManagerService,
    ) {
        this.joinedRooms = new Set();
        this.availableRooms = new Set();
    }

    initJoinedRooms(rooms: string[]): void {
        this.joinedRooms.clear();
        for (let i = 0; i < rooms.length; i++) {
            this.joinedRooms.add(rooms[i]);
        }
    }

    initAvailableRooms(rooms: string[]): void {
        this.availableRooms.clear();
        for (let i = 0; i < rooms.length; i++) {
            if (!this.isJoined(rooms[i])) {
                this.availableRooms.add(rooms[i]);
            }
        }
    }

    isJoined(name: string): boolean {
        return this.joinedRooms.has(name);
    }

    getJoinedRooms(): Set<string> {
        return this.joinedRooms;
    }

    getAvailableRooms(): Set<string> {
        return this.availableRooms;
    }

    roomExists(room: string): boolean {
        if (this.availableRooms.has(room) || this.joinedRooms.has(room)) {
            return true;
        }
        return false;
    }

    setActiveTab(tab: number): void {
        this.activeTab = tab;
    }

    getActiveTab(): number {
        return this.activeTab;
    }

    addPrivateRoom(name: string): void {
        this.privateRooms = "[PRIV]" + name;
        if (this.privateRooms !== undefined) {
            if(this.privateRooms.trim().length > 0){
                this.joinedRooms.add(this.privateRooms);
            } else {
                this.joinedRooms.delete(this.privateRooms);
            }
        } 
    }

    removePrivateRoom(): void {
        this.joinedRooms.delete(this.privateRooms);
        if(this.roomMessagesService.roomName !== undefined && this.roomMessagesService.roomName.startsWith("[PRIV]")){
            this.componentManagerService.setChatComponent(ComponentsDisplay.CONVO);
        }
        this.privateRooms = "";
        this.socketioService.getJoinedChatrooms({});
        this.getJoinedRooms();
    }

    getNoAvailableRooms(): boolean {
        if (this.availableRooms.size > 0) {
            return false;
        }
        return true;
    }
    
}

