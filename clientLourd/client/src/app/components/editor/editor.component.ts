import { Component, OnInit, ViewChild } from "@angular/core";
import { Tool } from "@app/classes/tool";
import { AttributeBarComponent } from "@app/components/attribute-bar/attribute-bar.component";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";

@Component({
    selector: "app-editor",
    templateUrl: "./editor.component.html",
    styleUrls: ["./editor.component.scss"]
})
export class EditorComponent implements OnInit{
    displayValue: string = "none";
    @ViewChild("attributeBar") bar: AttributeBarComponent;
    lastColors: string[] = new Array<string>();
    currentTool: Tool = this.tools.currentTool;
    displaySidebar: boolean = false;

    constructor(
        private tools: ToolsManagerService,
        public gameManagerService: GameManagerService
    ) {
    }

    ngOnInit() {
        if(this.gameManagerService.mode === "solo"){
            this.tools.setTools("");
            this.gameManagerService.artist = "";    
        }
    }

    isArtist(): boolean {
        return  this.gameManagerService.isArtist();
    }

}
