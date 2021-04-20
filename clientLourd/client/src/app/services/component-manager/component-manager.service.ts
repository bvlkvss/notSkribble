import { Injectable } from "@angular/core";
import { ComponentsDisplay } from "@app/enum/components";

@Injectable({
    providedIn: "root"
})
export class ComponentManagerService {

    currentComponent: ComponentsDisplay;
    chatComponent: ComponentsDisplay;
    currentGameComponent: ComponentsDisplay;

    constructor() {
        this.currentComponent = ComponentsDisplay.CONNECTION;
        this.chatComponent = ComponentsDisplay.CONVO;
        this.currentGameComponent = ComponentsDisplay.MENUPAGE;
    }

    setComponent(component: ComponentsDisplay): void {
        this.currentComponent = component;
    }

    setChatComponent(component: ComponentsDisplay): void {
        this.chatComponent = component;
    }

    setGameComponent(component: ComponentsDisplay): void {
        if (component === ComponentsDisplay.MENUPAGE || component === ComponentsDisplay.CLASSIC_GAME
            || component === ComponentsDisplay.CLASSIC_LOBBY || component === ComponentsDisplay.SOLO_GAME
            || component === ComponentsDisplay.COOP_GAME || component === ComponentsDisplay.COOP_LOBBY
            || component === ComponentsDisplay.BLIND_GAME || component === ComponentsDisplay.BLIND_LOBBY
            || component === ComponentsDisplay.FREE_GAME || component === ComponentsDisplay.JOIN_GAME) {
            this.currentGameComponent = component;
        }
    }

    resetComponent(): void {
        this.currentComponent = ComponentsDisplay.CONNECTION;
        this.chatComponent = ComponentsDisplay.CONVO;
        this.currentGameComponent = ComponentsDisplay.MENUPAGE;
    }

    isInGame(): boolean {
        return this.currentGameComponent === ComponentsDisplay.CLASSIC_GAME ||
            this.currentGameComponent === ComponentsDisplay.SOLO_GAME ||
            this.currentGameComponent === ComponentsDisplay.COOP_GAME ||
            this.currentGameComponent === ComponentsDisplay.BLIND_GAME ||
            this.currentGameComponent === ComponentsDisplay.FREE_GAME;
    }
}
