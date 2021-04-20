import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Pixel } from "@app/classes/pixel";
import { Vec2 } from "@app/classes/vec2";
import { DialogComponent } from "@app/components/sign-up/dialog/dialog.component";
import { ComponentsDisplay } from "@app/enum/components";
import { Text } from "@app/enum/text";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { EraserService } from "@app/services/tools/eraser/eraser-service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Injectable({
    providedIn: "root"
})
export class ServerEventsService {

    constructor(
        public dialog: MatDialog,
        public componentManagerService: ComponentManagerService,
        public currentUserService: CurrentUserService,
        public router: Router,
        private socketio: SocketioService,
        private roomMessagesService: RoomMessagesService,
        private pencilService: PencilService,
        private undoRedoService: UndoRedoService,
        private eraserService: EraserService,
        private tutorialService: TutorialService
    ) { }

    public openDialogCreateUser(code: number): void {
        let object = {};
        if (code === 1) {
            object = {
                message: Text.USER_CREATED
            };
        } else if (code === 2) {
            object = {
                message: Text.USER_CREATE_FAILED
            };
        } else if (code === 3) {
            object = {
                message: Text.MISSING_FIELD
            };
        } else if (code === 4) {
            object = {
                message: Text.USERNAME_TAKEN
            };
        }

        const dialogRef = this.dialog.open(DialogComponent, { data: object });

        dialogRef.afterClosed().subscribe(result => {
            if (code === 1) {
                this.joinRoomGeneral();
                this.componentManagerService.setComponent(ComponentsDisplay.MAINGAMEPAGE);
                this.tutorialService.startTutorial();
            } else {
                this.router.navigateByUrl("/signup", { skipLocationChange: true }).then(() => {
                    this.router.navigate(["SignUpComponent"]);
                });
            }
        });
    }

    public openDialogDisconnect(): void {

        let object = {
            message: Text.DISCONNECT
        };

        const dialogRef = this.dialog.open(DialogComponent, { data: object });
        this.onDisconnect();
        dialogRef.afterClosed().subscribe(result => {
        });

    }

    public onDisconnect(): void {
        this.componentManagerService.resetComponent();
        this.currentUserService.removeUser();
        this.roomMessagesService.emptyMessages();
    }

    public openDialogServerDown(): void {
        let object = {
            message: Text.SERVER_DOWN
        };

        const dialogRef = this.dialog.open(DialogComponent, { data: object });

        dialogRef.afterClosed().subscribe(result => {
            this.onDisconnect();
        });

    }
    public openDialogLoginUser(code: number): void {
        let object;
        if (code === 1) {
            object = {
                message: Text.LOGIN_VALID
            };
        } else if (code === 2) {
            object = {
                message: Text.LOGIN_FAILED
            };
        } else if (code === 3) {
            object = {
                message: Text.MISSING_FIELD
            };
        } else if (code === 4) {
            object = {
                message: Text.LOGIN_INVALID
            };
        } else if (code === 5) {
            object = {
                message: Text.LOGIN_INVALID
            };
        } else if (code === 6) {
            object = {
                message: Text.ALREADY_CONNECT
            };
        }

        const dialogRef = this.dialog.open(DialogComponent, { data: object });

        dialogRef.afterClosed().subscribe(result => {
            if (code === 1) {
                this.componentManagerService.setComponent(ComponentsDisplay.MAINGAMEPAGE);
                this.tutorialService.activeTab = 0;
                this.joinRoomGeneral();
            } else {
                this.router.navigateByUrl("/login", { skipLocationChange: true }).then(() => {
                    this.router.navigate(["ConnectionComponent"]);
                });
            }
        });
    }

    joinRoomGeneral() {
        let room = {
            username: this.currentUserService.getUser(),
            room: "general"
        };
        this.socketio.joinRoom(room);
    }

    getDrawing(data: Pixel[]): void {

        for (let pixel of data) {
            if (pixel.width !== undefined && pixel.color !== undefined && pixel.positionX !== undefined && pixel.positionY !== undefined) {
                if (pixel.type === "pencil") {
                    this.getPencilDrawing(pixel.width, pixel.color, pixel.positionX, pixel.positionY);
                    if (pixel.isDone) {
                        this.pencilService.appendDrawing();
                    }
                } 
                else if(pixel.type === "eraser"){

                    this.getEraserLine(pixel.width, pixel.positionX, pixel.positionY);
                    if(pixel.isDone){
                        this.eraserService.appendDrawing();
                    }
                }
            } else if (pixel.type === "undo" && !this.undoRedoService.classicService.isUserDrawing) {
                this.undoRedoService.undoLast();
            } else if (pixel.type === "redo" && !this.undoRedoService.classicService.isUserDrawing){
                this.undoRedoService.redoPrev();
            }
        }

    }

    private getPencilDrawing(width: number, color: string, positionX: number, positionY: number): void {
        this.pencilService.lineWidth = width;
        let colorHex = "#" + color.substring(3, 9) + color.substring(1, 3);
        this.pencilService.primaryColor = colorHex;
        this.pencilService.appendIsDrawing({ x: positionX, y: positionY } as Vec2);
    }

    private getEraserLine(width: number, positionX: number, positionY: number): void {
        this.eraserService.lineWidth = width;
        this.eraserService.appendIsDrawing({ x: positionX, y: positionY } as Vec2);
    }

    endLine(data: any): void {
        if (data === "pencil") {
            this.pencilService.appendDrawing();
        } else {
            this.eraserService.appendDrawing();
        }
    }
}
