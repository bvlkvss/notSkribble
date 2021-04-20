import { Injectable } from "@angular/core";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";


@Injectable({
    providedIn: "root"
})
export class RoomMessagesWindowService {
    roomName: string;
    messages: string[];
    openChat: boolean = false;
    user: string;

    constructor(
        private chatWindowManagerService: ChatWindowManagerService,
        private currentUserService: CurrentUserService
    ) {
        this.messages = [];
    }

    addMessage(msg: string): void {
        let data = {
            username: "",
            room: this.roomName,
            message: msg
        };
        this.chatWindowManagerService.sendMessage(data);
    }

    emptyMessages(): void {
        this.messages = [];
    }

    printMessage(data: any): void {
        let mess = data.user + ": " + data.message + "      (" + data.timestamp + ")";
        this.messages.push(mess);
    }

    getMessages(logs: any[]): void {
        this.messages = [];
        let foundLimit = false;
        if (this.openChat) {
            for (let i = 0; i < logs.length; i++) {
                if (!foundLimit && this.afterConnection(logs[i].timestamp, logs[i].date_time)) {
                    foundLimit = true;
                }
                if (foundLimit) {
                    this.printMessage(logs[i]);
                }
            }
            this.openChat = false;
        } else {
            for (let i = 0; i < logs.length; i++) {
                this.printMessage(logs[i]);
            }
        }
    }

    afterConnection(time: string, date: string): boolean {
        let array = time.split(":");
        let newDate: Date = new Date(date);
        if (newDate.getDate() > +this.currentUserService.lastConnectionDate.day) {
            return true;
        } else if (newDate.getDate() === this.currentUserService.lastConnectionDate.day) {
            if (+array[0] > this.currentUserService.lastConnectionTime.hour) {
                return true;
            } else if (+array[0] === this.currentUserService.lastConnectionTime.hour) {
                if (+array[1] > this.currentUserService.lastConnectionTime.minute) {
                    return true;
                } else if (+array[1] === this.currentUserService.lastConnectionTime.minute) {
                    if (+array[2] > this.currentUserService.lastConnectionTime.second) {
                        return true;
                    } else if (+array[2] === this.currentUserService.lastConnectionTime.second) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}
