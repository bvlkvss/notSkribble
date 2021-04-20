import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import {MatTableModule} from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ColorPaletteComponent } from "@app/components/color-picker/color-palette/color-palette.component";
import { ColorPickerComponent } from "@app/components/color-picker/color-picker.component";
import { ColorSliderComponent } from "@app/components/color-picker/color-slider/color-slider.component";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxElectronModule } from "ngx-electron";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./components/app/app.component";
import { AttributeBarComponent } from "./components/attribute-bar/attribute-bar.component";
import { ChatWindowComponent } from "./components/chat-window/chat-window.component";
import { ConvoWindowComponent } from "./components/chat-window/convo-window/convo-window.component";
import { RoomMessageWindowComponent } from "./components/chat-window/convo-window/room-message-window/room-message-window.component";
import { CreateChatWindowComponent } from "./components/chat-window/create-chat-window/create-chat-window.component";
import { JoinChatWindowComponent } from "./components/chat-window/join-chat-window/join-chat-window.component";
import { ChatComponent } from "./components/chat/chat.component";
import { ConvoComponent } from "./components/chat/convo/convo.component";
import { RoomMessageComponent } from "./components/chat/convo/room-message/room-message.component";
import { CreateChatComponent } from "./components/chat/create-chat/create-chat.component";
import { ResponseComponent } from "./components/chat/create-chat/response/response.component";
import { JoinChatComponent } from "./components/chat/join-chat/join-chat.component";
import { CommonPageComponent } from "./components/common-page/common-page.component";
import { ConnectionComponent } from "./components/connection/connection.component";
import { DrawingComponent } from "./components/drawing/drawing.component";
import { EditorComponent } from "./components/editor/editor.component";
import { GameDialogComponent } from "./components/game-mode/game-dialog/game-dialog.component";
import { GameModeComponent } from "./components/game-mode/game-mode.component";
import { ModeBlindComponent } from "./components/game-mode/mode-blind/mode-blind.component";
import { ModeClassicComponent } from "./components/game-mode/mode-classic/mode-classic.component";
import { ModeCoopComponent } from "./components/game-mode/mode-coop/mode-coop.component";
import { ModeFreeComponent } from "./components/game-mode/mode-free/mode-free.component";
import { ModeSoloComponent } from "./components/game-mode/mode-solo/mode-solo.component";
import { JoinGameComponent } from "./components/join-game/join-game.component";
import { LobbyCoopComponent } from "./components/lobby/lobby-coop/lobby-coop.component";
import { LobbyTeamsComponent } from "./components/lobby/lobby-teams/lobby-teams.component";
import { LobbyComponent } from "./components/lobby/lobby.component";
import { TransitionComponent } from "./components/lobby/transition/transition.component";
import { MainGamePageComponent } from "./components/main-game-page/main-game-page.component";
import { MainMenuComponent } from "./components/main-menu/main-menu.component";
import { OptionsComponent } from "./components/main-menu/options/options.component";
import { ProfilComponent } from "./components/main-menu/profil/profil.component";
import { TutorialComponent } from "./components/main-menu/tutorial/tutorial.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { DialogComponent } from "./components/sign-up/dialog/dialog.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { ViewDrawingComponent } from "./components/view-drawing/view-drawing.component";
import { DrawImageComponent } from "./components/word-image/draw-image/draw-image.component";
import { PreviewDrawingComponent } from "./components/word-image/preview-drawing/preview-drawing.component";
import { WordImageComponent } from "./components/word-image/word-image.component";
import { SocketioService } from "./services/socketio.service";
import { NoJoinComponent } from './components/join-game/no-join/no-join.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        EditorComponent,
        CommonPageComponent,
        AttributeBarComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        DrawingComponent,
        ColorPickerComponent,
        ConnectionComponent,
        SignUpComponent,
        MainGamePageComponent,
        DialogComponent,
        MainMenuComponent,
        ChatComponent,
        ConvoComponent,
        CreateChatComponent,
        JoinChatComponent,
        RoomMessageComponent,
        JoinGameComponent,
        LobbyComponent,
        ModeClassicComponent,
        ModeBlindComponent,
        ModeSoloComponent,
        ModeCoopComponent,
        ModeFreeComponent,
        GameModeComponent,
        LobbyTeamsComponent,
        WordImageComponent,
        DrawImageComponent,
        ViewDrawingComponent,
        ResponseComponent,
        GameDialogComponent,
        OptionsComponent,
        PreviewDrawingComponent,
        ChatWindowComponent,
        JoinChatWindowComponent,
        ConvoWindowComponent,
        CreateChatWindowComponent,
        RoomMessageWindowComponent,
        LobbyCoopComponent,
        ProfilComponent,
        TransitionComponent,
        TutorialComponent,
        NoJoinComponent
    ],
    imports: [
        BrowserModule,
        MatProgressSpinnerModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatMenuModule,
        MatCardModule,
        MatCheckboxModule,
        MatListModule,
        FormsModule,
        MatFormFieldModule,
        MatChipsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule,
        MatButtonToggleModule,
        MatTableModule,
        MatSelectModule,
        MatSidenavModule,
        MatInputModule,
        MatTabsModule,
        ReactiveFormsModule,
        NgxElectronModule,
        NgMultiSelectDropDownModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    providers: [SocketioService, HttpClient],
    bootstrap: [AppComponent],
})
export class AppModule { }
