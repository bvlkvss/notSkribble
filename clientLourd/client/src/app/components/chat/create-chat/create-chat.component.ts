import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ResponseComponent } from "@app/components/chat/create-chat/response/response.component";
import { ComponentsDisplay } from "@app/enum/components";
import { Text } from "@app/enum/text";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesService } from "@app/services/room-messages/room-messages.service";
import { SocketioService } from "@app/services/socketio.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";

const ALPHA_NUMERIC_REGEX: RegExp = /^[a-zA-Z0-9_]*$/;

@Component({
    selector: "app-create-chat",
    templateUrl: "./create-chat.component.html",
    styleUrls: ["./create-chat.component.scss"]
})
export class CreateChatComponent implements OnInit {

    public text = Text;
    public roomNameForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private socketio: SocketioService,
        public currentUserService: CurrentUserService,
        private componentManagerService: ComponentManagerService,
        private convoManagerService: ConvoManagerService,
        private roomMessagesService: RoomMessagesService,
        private dialog: MatDialog,
        public tutorialService: TutorialService
    ) {
        this.CreateroomNameForm();
    }

    ngOnInit(): void {
    }

    private CreateroomNameForm(): void {
        this.roomNameForm = this.formBuilder.group({
            roomname: new FormControl("", [Validators.required, Validators.pattern(ALPHA_NUMERIC_REGEX)])
        });
    }

    createRoom(): void {

        let data = {
            username: this.currentUserService.getUser(),
            room: this.roomNameForm.get("roomname")?.value
        };

        if (this.convoManagerService.roomExists(this.roomNameForm.get("roomname")?.value)) {
            const dialogRef = this.dialog.open(ResponseComponent, {
                width: "300px",
                height: "150px",
                position: {
                    top: "300px",
                    right: "100px"
                }
            });

            dialogRef.afterClosed().subscribe(result => {
            });
        } else {
            this.socketio.joinRoom(data);
            this.roomMessagesService.roomName = this.roomNameForm.get("roomname")?.value;
            this.roomMessagesService.emptyMessages();
            this.convoManagerService.setActiveTab(0);
            this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
        }
        this.roomNameForm.get("roomname")?.setValue("");
        this.roomNameForm.reset();
    }
}
