import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ComponentsDisplay } from "@app/enum/components";
import { Text } from "@app/enum/text";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { SocketioService } from "@app/services/socketio.service";

@Component({
    selector: "app-connection",
    templateUrl: "./connection.component.html",
    styleUrls: ["./connection.component.scss"]
})
export class ConnectionComponent implements OnInit {
    hide = true;
    public text = Text;
    public loginForm: FormGroup;
    public displayType = ComponentsDisplay;

    constructor(
        public componentManagerService: ComponentManagerService,
        private formBuilder: FormBuilder,
        private socketio: SocketioService,
        public currentUserService: CurrentUserService
    ) {
        this.createLoginForm();
    }

    ngOnInit(): void {
        this.currentUserService.removeUser();
    }

    private createLoginForm(): void {
        this.loginForm = this.formBuilder.group({
            username: new FormControl("", [Validators.required]),
            password: new FormControl("", [Validators.required])
        });
    }

    connect(): void {
        let data = {
            username: this.loginForm.get("username")?.value,
            password: this.loginForm.get("password")?.value
        };
        this.currentUserService.setUser(data.username);
        console.log(data);
        this.socketio.loginUser(data);
    }

    onEnter(): void {
        if (!this.loginForm.invalid) {
            this.connect();
        }
    }
}
