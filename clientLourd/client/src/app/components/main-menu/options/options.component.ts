import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { TutorialService } from "@app/services/tutorial/tutorial.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
import { TranslateService } from "@ngx-translate/core";
import { ElectronService } from "ngx-electron";

@Component({
    selector: "app-options",
    templateUrl: "./options.component.html",
    styleUrls: ["./options.component.scss"]
})
export class OptionsComponent implements OnInit {

    options: FormGroup;
    languageControl = new FormControl(localStorage.getItem("lang") || "fr");
    themeControl = new FormControl(localStorage.getItem("theme") || "light-theme");

    constructor(
        public formBuilder: FormBuilder,
        public currentUserService: CurrentUserService,
        private translateService: TranslateService,
        public tutorialService: TutorialService,
        private electronService: ElectronService,
        public windowManagerService: WindowManagerService

    ) {
        this.currentUserService.setTheme(localStorage.getItem("theme") || "light-theme");
    }

    ngOnInit(): void {
        this.options = this.formBuilder.group({
            language: this.languageControl,
            theme: this.themeControl
        });
    }

    save(): void {
        let data = {
            lang: localStorage.getItem("lang"),
            theme: localStorage.getItem("theme")
        };
        this.electronService.ipcRenderer.send("option-change", data);
    }
    
    saveTheme(): void {
        localStorage.setItem("theme", this.themeControl.value);
        this.currentUserService.setTheme(this.themeControl.value);
        this.changeTheme(this.themeControl.value);
        this.save();
    }
    
    saveLang(): void {
        localStorage.setItem("lang", this.languageControl.value);
        this.translateService.use(localStorage.getItem("lang") || "fr");
        this.save();
    }

    changeTheme(theme: string): void {
        if (theme === "dark-theme") {
            localStorage.setItem("themeBack", "dark-theme-back");
            localStorage.setItem("themeTitle", "dark-theme-title");
            document.body.style.backgroundColor = "rgb(28, 28, 29)";
            this.currentUserService.setThemeBack("dark-theme-back");
            this.currentUserService.setThemeTitle("dark-theme-title");
        } else {
            localStorage.setItem("themeBack", "light-theme-back");
            localStorage.setItem("themeTitle", "light-theme-title");
            document.body.style.backgroundColor = "rgb(197, 195, 224)";
            this.currentUserService.setThemeBack("light-theme-back");
            this.currentUserService.setThemeTitle("light-theme-title");
        }
    }
}
