import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ComponentsDisplay } from "@app/enum/components";
import { Text } from "@app/enum/text";
import { AvatarService } from "@app/services/avatar/avatar.service";
import { ComponentManagerService } from "@app/services/component-manager/component-manager.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { SocketioService } from "@app/services/socketio.service";

const MIN_FORM_FIELD: number = 3;
const MAX_FORM_FIELD: number = 10;
const MIN_PASSWORD_FIELD: number = 8;
const MAX_PASSWORD_FIELD: number = 16;
const ALPHA_NUMERIC_REGEX: RegExp = /^[a-zA-Z0-9_]*$/;

@Component({
    selector: "app-sign-up",
    templateUrl: "./sign-up.component.html",
    styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit {
    public displayType = ComponentsDisplay;
    public text = Text;
    public userForm: FormGroup;
    public usernameTaken: number;

    constructor(
        public componentManagerService: ComponentManagerService,
        private formBuilder: FormBuilder,
        public dialog: MatDialog,
        private socketio: SocketioService,
        public currentUserService: CurrentUserService,
        public avatarService: AvatarService
    ) {
        this.createFormGroup();
    }
    ngOnInit(): void {
        this.currentUserService.removeUser();
    }

    private createFormGroup(): void {
        this.userForm = this.formBuilder.group({
            username: new FormControl("", [
                Validators.required,
                Validators.minLength(MIN_FORM_FIELD),
                Validators.maxLength(MAX_FORM_FIELD),
                Validators.pattern(ALPHA_NUMERIC_REGEX)
            ]),
            firstName: new FormControl("", [
                Validators.required,
                Validators.minLength(MIN_FORM_FIELD),
                Validators.maxLength(MAX_FORM_FIELD),
                Validators.pattern(ALPHA_NUMERIC_REGEX)
            ]),
            lastName: new FormControl("", [
                Validators.required,
                Validators.minLength(MIN_FORM_FIELD),
                Validators.maxLength(MAX_FORM_FIELD),
                Validators.pattern(ALPHA_NUMERIC_REGEX)
            ]),
            password: new FormControl("", [
                Validators.required,
                Validators.minLength(MIN_PASSWORD_FIELD),
                Validators.maxLength(MAX_PASSWORD_FIELD)
            ]),
            confirmPassword: new FormControl("", [
                Validators.required
            ]),
            avatar: new FormControl("", [Validators.required]),
        }, { validator: this.matchingPassword });
    }

    private matchingPassword(formGroup: FormGroup): { passwordNotMatch: boolean } | null {
        return formGroup.get("password")?.value === formGroup.get("confirmPassword")?.value ? null : { passwordNotMatch: true };
    }

    public createAccount(): void {
        this.avatarService.setAvatar(+this.userForm.get("avatar")?.value);
        let user = {
            username: this.userForm.get("username")?.value,
            first_name: this.userForm.get("firstName")?.value,
            last_name: this.userForm.get("lastName")?.value,
            password: this.userForm.get("password")?.value,
            avatar: +this.userForm.get("avatar")?.value
        };
        this.currentUserService.setUser(user.username);
        this.socketio.createUser(user);
    }

    public onEnter(): void {
        if(!this.userForm.invalid) {
            this.createAccount();
        }
    }
}