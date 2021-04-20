import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ResponseComponent } from "@app/components/chat/create-chat/response/response.component";
import { ComponentsDisplay } from "@app/enum/components";
import { Text } from "@app/enum/text";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { ConvoManagerService } from "@app/services/convo-manager/convo-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { RoomMessagesWindowService } from "@app/services/room-messages/room-messages-window/room-messages-window.service";
import { ChatWindowManagerService } from "@app/services/window-manager/chat-window-manager/chat-window-manager.service";

const ALPHA_NUMERIC_REGEX: RegExp = /^[a-zA-Z0-9_]*$/;

@Component({
  selector: "app-create-chat-window",
  templateUrl: "./create-chat-window.component.html",
  styleUrls: ["./create-chat-window.component.scss"]
})
export class CreateChatWindowComponent implements OnInit {

  public text = Text;
    public roomNameForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private componentManagerService: ComponentManagerService,
        private convoManagerService: ConvoManagerService,
        private roomMessagesWindowService: RoomMessagesWindowService,
        private chatWindowManagerService: ChatWindowManagerService,
        private dialog: MatDialog,
        public currentUserService: CurrentUserService
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
            username: "",
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

            this.chatWindowManagerService.joinRoom(data);
            
            this.roomMessagesWindowService.roomName = this.roomNameForm.get("roomname")?.value;
            this.roomMessagesWindowService.emptyMessages();
            this.convoManagerService.setActiveTab(0);
            this.componentManagerService.setChatComponent(ComponentsDisplay.ROOM_MESSAGES);
        }
        this.roomNameForm.get("roomname")?.setValue("");
        this.roomNameForm.reset();
    }
}