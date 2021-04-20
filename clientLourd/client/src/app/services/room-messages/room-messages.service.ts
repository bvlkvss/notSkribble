import { Injectable } from "@angular/core";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { SocketioService } from "@app/services/socketio.service";

@Injectable({
    providedIn: "root"
})
export class RoomMessagesService {
    roomName: string;
    messages: string[];
    openChat: boolean = false;

    constructor(
        private socketioService: SocketioService,
        private currentUserService: CurrentUserService
    ) {
        this.messages = [];
    }

    getMessageSinceConnection(): void {
        this.socketioService.getStats({});
        this.socketioService.getHistory({ room: this.roomName });
        this.openChat = true;
    }

    addMessage(msg: string): void {
        let ob = {
            username: this.currentUserService.getUser(),
            room: this.roomName,
            message: msg
        };
        this.socketioService.sendChatroomMessage(ob);
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
