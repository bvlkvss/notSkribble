import { Component, ElementRef, /*Input,*/ OnChanges, ViewChild } from "@angular/core";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";
import { GridService } from "@app/services/tools/grid/grid.service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnChanges {
    subscription: Subscription;
    currentToolName: string;
    isRevertClicked: boolean;
    attributeBarIsActive: boolean;

    constructor(
        public tools: ToolsManagerService,
        protected drawingService: DrawingService,
        protected invoker: UndoRedoService,
    ) {
        this.isRevertClicked = false;
        this.attributeBarIsActive = false;
    }

    @ViewChild("icons", { static: false }) toolIcons: ElementRef<HTMLCanvasElement>;
    ngOnChanges(): void {
        this.subscription = this.drawingService.getMessage().subscribe((message: string) => {
            const numberOfTools = this.toolIcons.nativeElement.getElementsByTagName("a").length;
            for (let i = 0; i < numberOfTools; i++) {
                this.toolIcons.nativeElement.getElementsByTagName("a")[i].classList.remove("active");
            }
            this.toolIcons.nativeElement.querySelector("#" + message)?.setAttribute("class", "active");
        });

        if (!this.isRevertClicked) {
        }
        this.isRevertClicked = false;
    }

    undo(): void {
        this.invoker.undoLast();
    }

    redo(): void {
        this.invoker.redoPrev();
    }

    undoRedoAllowed(): boolean {
        return this.invoker.getIsAllowed();
    }


    displayPalette(toolName: string): void {
        if (this.attributeBarIsActive) {
            this.attributeBarIsActive = true;
            this.togglecanvas("drawing-container-open");
            this.toggleAttributeBar("attribute-open");
        } 
    }

    toggleAttributeBar(classname: string): void {
        document.querySelectorAll("#attribute").forEach((item) => {
            item.setAttribute("class", classname);
        });
    }

    toggleColorPalette(): void {
            if (document.querySelector("#primaryColorPicker")?.getAttribute("style") === "display:block")
                document.querySelector("#primaryColorPicker")?.setAttribute("style", "display:none");
            else {
                document.querySelector("#primaryColorPicker")?.setAttribute("style", "display:block");
            }
    }

    togglecanvas(classname: string): void {
        document.getElementById("drawing-div")?.setAttribute("class", classname);
    }

    changeTools(name: string): void {
        this.drawingService.restoreCanvasState();
        this.tools.setTools(name);
        if (this.tools.currentTool instanceof GridService) {
            this.tools.currentTool.onKeyDown({ key: "g" } as KeyboardEvent);
        }
        const numberOfTools = this.toolIcons.nativeElement.getElementsByTagName("a").length;
        for (let i = 0; i < numberOfTools; i++) {
            this.toolIcons.nativeElement.getElementsByTagName("a")[i].classList.remove("active");
        }
        this.toolIcons.nativeElement.querySelector("#" + name)?.setAttribute("class", "active");
    }

    revertColors(): void {
        this.isRevertClicked = true;
        const primColorDiv = document.querySelector(".color-box1") as HTMLElement;
        const secondColorDiv = document.querySelector(".color-box2") as HTMLElement;
        const tmpPrimaryColor: string = this.tools.currentTool.primaryColor;
        const tmpSecondaryColor: string = this.tools.currentTool.secondaryColor;
        this.tools.currentTool.primaryColor = tmpSecondaryColor;
        this.tools.currentTool.secondaryColor = tmpPrimaryColor;
        primColorDiv.style.backgroundColor = this.tools.currentTool.primaryColor;
        secondColorDiv.style.backgroundColor = this.tools.currentTool.secondaryColor;
    }
    getInvoker(): UndoRedoService {
        return this.invoker;
    }
}
