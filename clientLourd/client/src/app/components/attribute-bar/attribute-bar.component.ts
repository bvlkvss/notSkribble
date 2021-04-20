import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Const } from "@app/classes/constants";
import { Tool } from "@app/classes/tool";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";
import { GridService } from "@app/services/tools/grid/grid.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-attributebar",
    templateUrl: "./attribute-bar.component.html",
    styleUrls: ["./attribute-bar.component.scss"],
})
export class AttributeBarComponent implements OnInit {
    static showStamps: boolean = false;
    widthValue: string;
    dropletsWidthValue: string;
    frequency: string;
    radius: string;
    lenghtValue: string;
    angleValue: string;
    junctionWidth: string;
    idStyleRectangle: number;
    idStyleBrush: number;
    degreeValue: string;
    tolerance: string;
    squareSize: string;
    opacity: string;
    leftStampFactorValue: number;
    rightStampFactorValue: number;
    selectedValue: string;
    polices: string[];
    circleIsShown: boolean;
    @ViewChild("pipette", { static: false }) pipetteCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild("stampIcon") stampIcon: ElementRef<HTMLElement>;
    @ViewChild("a") a: ElementRef<HTMLElement>;

    pipetteCtx: CanvasRenderingContext2D;
    currentStamp: string = "../../../assets/Stamps/Poop Emoji.png";
    currentTexture: string = "../../../assets/b1.svg";
    subscription: Subscription;
    constructor(private tools: ToolsManagerService) {
        this.degreeValue = "0";
        this.circleIsShown = true;
        this.dropletsWidthValue = "1";
        this.frequency = "700";
        this.radius = "20";
        this.lenghtValue = "50";
        this.angleValue = "0";
        this.junctionWidth = "1";
        this.idStyleRectangle = 2;
        this.idStyleBrush = 1;
        this.tolerance = "0";
        this.squareSize = "25";
        this.polices = ["Arial", "Times New Roman", "Tahoma", "Verdana", "Comic Sans MS, cursive"];
        this.opacity = "50";
        this.leftStampFactorValue = 1;
        this.rightStampFactorValue = 1;
        this.onClick();
    }
    private showContainer: boolean = false;
    private lastTool: Tool = this.tools.currentTool;

    ngOnInit(): void {
        this.widthValue = this.tools.currentTool.lineWidth.toString();
    }

    onClick(): void {}
    
    changeStyle(styleToChangeId: string, styleId: number): void {
        const shapeStyle = document.querySelector("#style" + styleId) as HTMLElement;
        const currentStyle = document.querySelector("#" + styleToChangeId) as HTMLElement;

        if (shapeStyle && currentStyle) {
            currentStyle.style.borderColor = window.getComputedStyle(shapeStyle).borderColor;
            currentStyle.style.backgroundColor = window.getComputedStyle(shapeStyle).backgroundColor;
            currentStyle.style.borderStyle = window.getComputedStyle(shapeStyle).borderStyle;
            currentStyle.style.borderWidth = window.getComputedStyle(shapeStyle).borderWidth;
        }
    }
    restoreValues(): void {
        if (this.tools.currentTool.lineWidth) this.widthValue = this.tools.currentTool.lineWidth.toString();
    }
    validate(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            event.preventDefault();
            return;
        }
        const WIDTH_ALLOWED_CHARS_REGEXP = /\b[0-9]+\b/;
        const target = event.target as HTMLInputElement;
        if (target.selectionStart === 0 && this.onToolChange("stamp") && target.id !== "LeftSideInput" && target.id !== "RightSideInput") {
            target.maxLength = event.key === "-" ? Const.MAX_INPUT_NEGATIVE_LENGTH : Const.MAX_INPUT_POSITIVE_LENGTH;
            return;
        }
        if (event.key !== "Backspace" && event.key !== "Enter" && !WIDTH_ALLOWED_CHARS_REGEXP.test(event.key)) {
            event.preventDefault();
        }
    }
    onToolChange(attribute: string): boolean {
        if (this.tools.currentTool instanceof GridService)
            (this.tools.currentTool as GridService).getSizeObservable().subscribe((squareSize: string) => {
                this.squareSize = squareSize;
            });
        if (this.lastTool !== this.tools.currentTool) {
            this.lastTool = this.tools.currentTool;
            this.restoreValues();
        }
       
        const numberOfTools = document.querySelectorAll("#a").length;
        for (let i = 0; i < numberOfTools; i++) {
            document.querySelectorAll("#a")[i].classList.remove("active");
        }
        return this.tools.currentTool.toolAttributes.includes(attribute);
    }
    
    setSquareSize(input: string): void {
        this.squareSize = input;
        if (Number(this.squareSize) > Const.MAX_WIDTH_VALUE) this.squareSize = "100";
        (this.tools.currentTool as GridService).changeSquareSize(Number(this.squareSize));
    }

    setOpacity(input: string): void {
        this.opacity = input;
        if (Number(this.opacity) > Const.MAX_WIDTH_VALUE) this.opacity = "100";
        (this.tools.currentTool as GridService).changeOpacity(Number(this.opacity));
    }

    toggleList(id: string): void {
        this.showContainer = !this.showContainer;
        const container = document.querySelector("#" + id) as HTMLElement;
        const icon = container.previousSibling?.lastChild as HTMLElement;
        if (this.showContainer) {
            if (container.id === "styleContainer") container.style.display = "flex";
            else container.style.display = "table-cell";
            icon.innerHTML = "expand_less";
        } else {
            container.style.display = "none";
            icon.innerHTML = "expand_more";
        }
    }
    

    setLineWidth(input: string): void {
        this.widthValue = input;
        if (Number(this.widthValue) > Const.MAX_WIDTH_VALUE) this.widthValue = "100";
        this.tools.setLineWidth(Number(this.widthValue));
    }

}
