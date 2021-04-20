import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CommonPageComponent } from "@app/components/common-page/common-page.component";
import { ConnectionComponent } from "@app/components/connection/connection.component";
import { SignUpComponent } from "@app/components/sign-up/sign-up.component";
import { ChatWindowComponent } from "./components/chat-window/chat-window.component";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: CommonPageComponent },
    { path: "signup", component: SignUpComponent },
    { path: "login", component: ConnectionComponent },
    { path: "chat", component: ChatWindowComponent },
    { path: "**", redirectTo: "/home" },
    
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true, relativeLinkResolution: "legacy" })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
