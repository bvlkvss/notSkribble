import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {NoJoinComponent} from "@app/components/join-game/no-join/no-join.component";
import { ComponentsDisplay } from "@app/enum/components";
import { GAMESTATUS } from "@app/enum/game-status";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { ClassicService } from "@app/services/classic/classic.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CoopService } from "@app/services/coop/coop.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { EffectService } from "@app/services/effect/effect.service";
import { FreeGameService } from "@app/services/free-game/free-game.service";
import { GameDialogService } from "@app/services/game-dialog/game-dialog.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { JoinRoomService } from "@app/services/join-room/join-room.service";
import { LobbyTeamsService } from "@app/services/lobby-teams/lobby-teams.service";
import { PreviewService } from "@app/services/preview/preview.service";
import { RoomMessagesWindowService } from "@app/services/room-messages/room-messages-window/room-messages-window.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { ServerEventsService } from "@app/services/server-events/server-events.service";
import { SocketioService } from "@app/services/socketio.service";
import { SoloService } from "@app/services/solo/solo.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
import { TranslateService } from "@ngx-translate/core";
import { ElectronService } from "ngx-electron";


@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    title = "socketio-angular";

    constructor(public socketService: SocketioService,
        private serverEventsService: ServerEventsService,
        public roomMessageService: RoomMessagesService,
        public roomMessageWindowService: RoomMessagesWindowService,
        private lobbyTeamsService: LobbyTeamsService,
        private gameManagerService: GameManagerService,
        private joinRoomService: JoinRoomService,
        private convoManagerService: ConvoManagerService,
        private gameDialogService: GameDialogService,
        private freeGameService: FreeGameService,
        private translateService: TranslateService,
        private electronService: ElectronService,
        private windowManagerService: WindowManagerService,
        private soloService: SoloService,
        private previewService: PreviewService,
        private coopService: CoopService,
        private componentManagerService: ComponentManagerService,
        private currentUserService: CurrentUserService,
        private effectService: EffectService,
        private classicService: ClassicService,
        private avatarService: AvatarService,
        private changeDetector: ChangeDetectorRef,
        public dialog: MatDialog
    ) {
        this.translateService.setDefaultLang("fr");
        this.translateService.use(localStorage.getItem("lang") || "fr");
    }

    ngOnInit() {
        this.socketService.setupSocketConnection();
        this.socketService.socket.on("create_user", (data: any) => {
            this.serverEventsService.openDialogCreateUser(data.code);
        });

        this.socketService.socket.on("authenticate_user", (data: any) => {
            console.log("authenticate_user");
            console.log(data);
            this.serverEventsService.openDialogLoginUser(data.code);
        });

        this.socketService.socket.on("disconnect", (data: any) => {
            this.serverEventsService.openDialogServerDown();
        });

        this.socketService.socket.on("disconnect_user", (data: any) => {
            this.serverEventsService.openDialogDisconnect();
        });

        this.socketService.socket.on("chatroom_message", (data: any) => {
            if (data.data.chatroom === this.roomMessageService.roomName) {
                this.roomMessageService.printMessage(data.data);
                this.electronService.ipcRenderer.send("message-sent", data.data);
            }
        });

        this.socketService.socket.on("connected_chatrooms", (data: any) => {
            this.convoManagerService.initJoinedRooms(data.data.rooms);
            this.electronService.ipcRenderer.send("joined-rooms", data.data.rooms);
        });
        this.socketService.socket.on("all_chatrooms", (data: any) => {
            this.convoManagerService.initAvailableRooms(data.data.rooms);
            this.electronService.ipcRenderer.send("available-rooms", data.data.rooms);
        });

        this.socketService.socket.on("join_chatroom", (data: any) => {
            let dataNull = {};
            this.socketService.getJoinedChatrooms(dataNull);
            this.socketService.getAvailableChatrooms(dataNull);
        });
        this.socketService.socket.on("leave_chatroom", (data: any) => {
            let dataNull = {};
            this.socketService.getJoinedChatrooms(dataNull);
            this.socketService.getAvailableChatrooms(dataNull);
        });

        this.socketService.socket.on("chatroom_logs", (data: any) => {
            this.roomMessageService.getMessages(data.data.logs);
            this.electronService.ipcRenderer.send("history", data.data.logs);
        });

        this.socketService.socket.on("join_gameroom", (data: any) => {
            if(data.code === 2){
                console.log("here")
                const dialogRef = this.dialog.open(NoJoinComponent);
                dialogRef.afterClosed().subscribe(result => {
                    console.log("send socket");
                    this.socketService.getGameRoom(this.joinRoomService.data);
                });
            
            } else {
                this.convoManagerService.addPrivateRoom(this.gameManagerService.name);
                this.electronService.ipcRenderer.send("add-priv", this.gameManagerService.name);
                this.joinRoomService.joinRooms = [];
                this.componentManagerService.setGameComponent(ComponentsDisplay.CLASSIC_LOBBY);
                if(this.gameManagerService.isClassicOrBlind()){
                    this.lobbyTeamsService.addPlayers(data.data.blue, data.data.red);
                    this.lobbyTeamsService.setVirtualOnJoin();
                    this.avatarService.setTeamAvatarClassic(data.data.blue_avatars, data.data.red_avatars);
                } else if(this.gameManagerService.mode === "coop"){
                    this.coopService.team = data.data.players;
                    this.avatarService.setTeamCoop(data.data.avatars);
                }
            }
        });

        this.socketService.socket.on("start_gameroom", (data: any) => {
            this.gameManagerService.setTriesWord(data.data.tries, data.data.word);
            
            if (this.gameManagerService.isClassicOrBlind()) {
                this.gameManagerService.startRound(data.data.drawer, data.data.endTime, data.data.startTime, data.data.word, data.data.tries);
                this.lobbyTeamsService.startGame();
                this.classicService.setGuessingTeam(data.data.drawer);
                this.effectService.startTimer();
                this.effectService.startCountDown();
            } else if (this.gameManagerService.mode === "solo") {
                this.soloService.resetGame();
                this.soloService.newRound(data.data.tries, data.data.word);
                this.soloService.setTime(data.data.startTime, data.data.endTime);
                this.soloService.startTimerSolo();
            } else if(this.gameManagerService.mode === "coop"){
                this.gameManagerService.artist = "";
                this.componentManagerService.setGameComponent(ComponentsDisplay.COOP_GAME);
                this.soloService.setTime(data.data.startTime, data.data.endTime);
                this.soloService.startTimerSolo();
                this.effectService.startTimer();
                this.effectService.startCountDown();
                this.soloService.resetGame();
                this.soloService.newRound(data.data.tries, data.data.word);

            }
        });

        this.socketService.socket.on("drawing_info", (data: any) => {
            if (this.gameManagerService.artist.startsWith("[VIRT]")) {
                this.gameManagerService.isVirtualDrawing = true;
            } else {
                this.gameManagerService.isVirtualDrawing = false;
                this.serverEventsService.getDrawing(data.data);
            }
        });

        this.socketService.socket.on("get_gamerooms", (data: any) => {
            this.joinRoomService.getGameRooms(data.data);
        });

        this.socketService.socket.on("end_line", (data: any) => {
            this.serverEventsService.endLine(data.data.type);
        });

        this.socketService.socket.on("verify_answer", (data: any) => {
            if (this.gameManagerService.isClassicOrBlind()) {
                this.verifyAnswerClassic(data);
            } else if (this.gameManagerService.mode === "solo" || this.gameManagerService.mode === "coop") {
                this.verifyAnswerSolo(data);
            }
        });

        this.socketService.socket.on("reply_right", (data: any) => {
            this.classicService.isTeamOneGuessing = !this.classicService.isTeamOneGuessing;
            this.gameDialogService.openDialog(GAMESTATUS.REPLY, "", "");
            this.gameManagerService.isReplyRight = true;
            this.gameManagerService.replyRight(data.data.endTime, data.data.startTime, 1);
            this.gameManagerService.waitUntil();
        });
        
        this.socketService.socket.on("game_info", (data: any) => {
            let arg = {};
            this.socketService.getJoinedChatrooms(arg);
            this.socketService.getAvailableChatrooms(arg);
        });

        this.socketService.socket.on("next_round", (data: any) => {
            if (this.gameManagerService.isClassicOrBlind()) {
                this.classicService.setGuessingTeam(data.data.drawer);
                this.gameManagerService.newRound(data.data.drawer, data.data.endTime, data.data.startTime, data.data.word, data.data.tries, data.data.blue_team_pts, data.data.red_team_pts);
            } else if (this.gameManagerService.mode === "solo" || this.gameManagerService.mode === "coop") {
                this.soloService.newRound(data.data.tries, data.data.word);
            }
        });

        this.socketService.socket.on("game_done", (data: any) => {
            if(this.gameManagerService.mode !== "free"){
                this.convoManagerService.removePrivateRoom();
            }
            if(this.gameManagerService.isClassicOrBlind()){
                this.gameManagerService.classicService.updateScore(data.data.blue_team_pts, data.data.red_team_pts);
                this.classicService.userTeam = this.classicService.getUserTeamColor();
                this.gameDialogService.openDialog(GAMESTATUS.END_GAME, data.data.winner, "");
            } else if(this.gameManagerService.isSoloOrCoop()){
                this.gameDialogService.openDialog(GAMESTATUS.END_SOLO_COOP, "", "");
            }
            this.gameManagerService.resetGame();
            this.lobbyTeamsService.resetLobby();
            this.coopService.resetCoopGame();
            this.soloService.resetGame();
        });

        this.socketService.socket.on("end_gameroom", (data: any) => {
            this.convoManagerService.removePrivateRoom();
            if(this.gameManagerService.isClassicOrBlind() || this.gameManagerService.mode === "coop"){
                this.gameDialogService.openDialog(GAMESTATUS.DECONNECTED_USER, "", "");
            }
            this.gameManagerService.resetGame();
            this.lobbyTeamsService.resetLobby();
            this.coopService.resetCoopGame();
            this.soloService.resetGame();
        });

        this.socketService.socket.on("get_word", (data: any) => {
            this.freeGameService.setNextWord(data.data.word);
        });

        this.socketService.socket.on("virtual_draw", (data: any) => {
            this.gameManagerService.isVirtualDrawing = true;
            this.previewService.setValues(data.data.type, data.data.lines, data.data.background, data.data.line_color, data.data.drawing_time);
        });

        this.socketService.socket.on("user_stats", (data: any) => {
            this.currentUserService.setUser(data.data.user_name);
            this.currentUserService.setUserInfo(data.data.first_name, data.data.last_name, data.data.game_count, data.data.win_ratio, data.data.average_game_time, data.data.total_game_time, data.data.solo_max_score);
            this.avatarService.setAvatar(data.data.avatar);
            this.currentUserService.addGames(data.data.game_history);
            this.currentUserService.addConnection(data.data.connection_timestamps, data.data.disconnection_timestamps);
        });

        this.electronService.ipcRenderer.on("simple-window", (event, arg) => {
            this.windowManagerService.setIsDetached(false);
            this.windowManagerService.setGamePageWidth(62);
            this.windowManagerService.setTransitionWidth(64);
            this.windowManagerService.setLobbyPageWidth(60.5);
        });

        this.electronService.ipcRenderer.on("dual-window", (event, arg) => {
            this.windowManagerService.setIsDetached(true);
            this.windowManagerService.setGamePageWidth(95);
            this.windowManagerService.setTransitionWidth(98);
            this.windowManagerService.setLobbyPageWidth(92.5);
        });

        this.electronService.ipcRenderer.on("get-joined-rooms", (event, arg) => {
            let data = {};
            this.socketService.getJoinedChatrooms(data);
        });

        this.electronService.ipcRenderer.on("get-available-rooms", (event, arg) => {
            let data = {};
            this.socketService.getAvailableChatrooms(data);
        });


        this.electronService.ipcRenderer.on("joined-rooms", (event, arg) => {
            this.convoManagerService.initJoinedRooms(arg);
        });

        this.electronService.ipcRenderer.on("available-rooms", (event, arg) => {
            this.convoManagerService.initAvailableRooms(arg);
        });

        this.electronService.ipcRenderer.on("quit-room", (event, arg) => {
            this.socketService.leaveRoom(arg);
            let data = {};
            this.socketService.getJoinedChatrooms(data);
        });

        this.electronService.ipcRenderer.on("join-room", (event, arg) => {
            arg.username = this.currentUserService.getUser();
            this.socketService.joinRoom(arg);
            let data = {};
            this.socketService.getJoinedChatrooms(data);
            this.socketService.getAvailableChatrooms(data);
        });

        this.electronService.ipcRenderer.on("send-message", (event, arg) => {
            arg.username = this.currentUserService.getUser();
            this.roomMessageService.roomName = arg.room;
            this.socketService.sendChatroomMessage(arg);
        });

        this.electronService.ipcRenderer.on("message-sent", (event, arg) => {
            this.roomMessageWindowService.printMessage(arg);
        });

        this.electronService.ipcRenderer.on("get-history", (event, arg) => {
            this.socketService.getHistory(arg);
        });

        this.electronService.ipcRenderer.on("history", (event, arg) => {
            this.roomMessageWindowService.getMessages(arg);
        });

        this.electronService.ipcRenderer.on("get-hint", (event, arg) => {
            this.roomMessageService.roomName = arg.name;
            this.socketService.askHint(arg);
        });

        this.electronService.ipcRenderer.on("option-change", (event, arg) => {
            this.changeDetector.detectChanges();
            this.translateService.use(arg.lang);
            this.currentUserService.setTheme(arg.theme);
        });

        this.electronService.ipcRenderer.on("add-priv", (event, arg) => {
            this.convoManagerService.addPrivateRoom(arg);
        });
    }

    private verifyAnswerSolo(data: any) {
        if(data.data.tries <= 0){
            this.gameManagerService.nTries = 0;
        } else {
            this.gameManagerService.nTries = data.data.tries;
        }
        if (data.data.is_valid) {
            this.effectService.playAudio();
            clearInterval(this.previewService.interval);            
            this.soloService.score++;
            this.gameManagerService.isGuessed = true;
            this.soloService.addTime(data.data.time);
            this.callNextRound();
        } else if(this.gameManagerService.nTries === 0){
            clearInterval(this.previewService.interval);
            this.callNextRound();
        }
    }

    private callNextRound(): void {
        if(this.currentUserService.getUser() === this.gameManagerService.name){
            this.socketService.nextRound({name: this.gameManagerService.name});
        }
    }

    private verifyAnswerClassic(data: any): void {
        this.gameManagerService.isReplyRight = false;
        this.gameManagerService.nTries = data.data.tries;

        if (data.data.is_valid) {
            this.effectService.playAudio();
            this.gameManagerService.isGuessed = true;
            if (this.gameManagerService.round !== 4) {
                this.gameDialogService.openDialog(GAMESTATUS.ANSWER_RIGHT, "", this.classicService.word);
            }
        } else if (this.gameManagerService.nTries === 0 && !data.data.is_reply_right && this.gameManagerService.isSendSocket()) {
            this.socketService.replyRight({ name: this.gameManagerService.name });
        } else if (this.gameManagerService.nTries === 0 && data.data.is_reply_right) {
            if (this.gameManagerService.round !== 4) {
                this.gameDialogService.openDialog(GAMESTATUS.ROUND_DONE, "", this.classicService.word);
            }
            this.gameManagerService.nextRound();
        }
    }

}
