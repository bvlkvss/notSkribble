import { Injectable } from "@angular/core";
import { io } from "socket.io-client";

@Injectable({
    providedIn: "root",
})
export class SocketioService {
    socket: any;

    constructor(
    ) {
    }

    setupSocketConnection() {
        this.socket = io("http://104.215.88.171:5000", {
        // this.socket = io("http://127.0.0.1:5000", {
        });
    }

    createUser(object: any): void {
        this.socket.emit("create_user", object);
    }

    loginUser(data: any): void {
        this.socket.emit("authenticate_user", data);
    }

    getAvailableChatrooms(data: any): void {
        this.socket.emit("all_chatrooms", data);
    }

    getJoinedChatrooms(data: any): void {
        this.socket.emit("connected_chatrooms", data);
    }

    joinRoom(data: any): void {
        this.socket.emit("join_chatroom", data);
    }

    leaveRoom(data: any): void {
        this.socket.emit("leave_chatroom", data);
    }

    sendChatroomMessage(data: any): void {
        this.socket.emit("chatroom_message", data);
    }

    getHistory(data: any): void {
        this.socket.emit("chatroom_logs", data);
    }

    disconnect(data: any): void {
        this.socket.emit("disconnect_user", data);
    }

    startGameRoom(data: any): void {
        this.socket.emit("start_gameroom", data);
    }

    sendPixel(data: any): void {
        this.socket.emit("drawing_info", data);
    }

    getGameRoom(data: any): void {
        this.socket.emit("get_gamerooms", data);
    }

    joinLobby(data: any): void {
        this.socket.emit("join_gameroom", data);
    }

    leaveLobby(data: any): void {
        this.socket.emit("quit_game", data);
    }

    endLine(data: any): void {
        this.socket.emit("end_line", data);
    }

    replyRight(data: any): void {
        this.socket.emit("reply_right", data);
    }

    nextRound(data: any): void {
        this.socket.emit("next_round", data);
    }

    endGame(data: any): void {
        this.socket.emit("game_done", data);
    }

    createGameRoom(data: any): void {
        this.socket.emit("game_info", data);
    }

    getNextWord(data: any): void {
        this.socket.emit("get_word", data);
    }

    createPair(data: any): void {
        this.socket.emit("add_pair", data);
    }

    addVirtualplayer(data: any): void {
        this.socket.emit("add_virtual_player", data);
    }

    removeVirtualPlayer(data: any): void {
        this.socket.emit("remove_virtual_player", data);
    }

    createTutoRoom(data: any): void {
        this.socket.emit("tuto_gameroom", data);
    }

    askHint(data: any): void {
        this.socket.emit("get_hint", data);
    }

    getStats(data: any): void {
        this.socket.emit("user_stats", data);
    }

}
