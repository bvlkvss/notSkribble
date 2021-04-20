import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, IterableDiffer, IterableDiffers, OnInit, ViewChild } from "@angular/core";
import { Command } from "@app/classes/command";
import { ClassicService } from "@app/services/classic/classic.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Component({
    selector: "app-drawing",
    templateUrl: "./drawing.component.html",
    styleUrls: ["./drawing.component.scss"],
})
export class DrawingComponent implements AfterViewInit, OnInit, DoCheck {
    @ViewChild("baseCanvas", { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild("container") container: ElementRef<HTMLDivElement>;
    @ViewChild("resizeContainer") resizeContainer: ElementRef<HTMLDivElement>;

    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild("previewCanvas", { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild("gridCanvas", { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    public sizeScreenWidth: number = 750;
    public sizeScreenHeight: number = 430;
    private keyBindings: Map<string, string> = new Map();
    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private mouseFired: boolean;
    private iterableDiffer: IterableDiffer<Command>;
    constructor(
        private drawingService: DrawingService,
        private tools: ToolsManagerService,
        private invoker: UndoRedoService,
        iDiffers: IterableDiffers,
        public gameManagerService: GameManagerService,
        public classicService: ClassicService,
        public currentUserService: CurrentUserService
    ) {
        this.iterableDiffer = iDiffers.find([]).create();
        if (!this.gameManagerService.isArtist()) {
            this.tools.setTools("");
        } else {
            this.tools.setTools("pencil");
        }
        this.invoker.ClearRedo();
        this.invoker.ClearUndo();

    }
    ngDoCheck(): void {
        const changesUndo = this.iterableDiffer.diff(this.invoker.getUndo());
        if (changesUndo) {
            if (this.baseCtx === undefined) {
                this.baseCtx = this.drawingService.baseCtx;
            }
        }
    }
    ngOnInit(): void {
        this.drawingService.resizeCanvas();
    }

    ngAfterViewInit(): void {
        this.keyBindings
            .set("c", "pencil")
            .set("e", "eraser")
            .set("g", "grid")
        this.baseCtx = this.baseCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.baseCtx.beginPath();
        this.baseCtx.fillStyle = "white";
        this.baseCtx.rect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.baseCtx.fill();
        this.baseCtx.closePath();
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;
        this.drawingService.canvasContainer = this.resizeContainer.nativeElement as HTMLDivElement;
        this.mouseFired = false;
        this.drawingService.blankCanvasDataUrl = this.drawingService.canvas.toDataURL();
        this.baseCtx.save();
        this.previewCtx.save();
        this.gridCtx.save();
        this.drawingService.afterViewObservable.next();
    }

    @HostListener("mousemove", ["$event"])
    onMouseMove(event: MouseEvent): void {
        this.tools.currentTool.onMouseMove(event);
    }

    @HostListener("mousedown", ["$event"])
    onMouseDown(event: MouseEvent): void {
        this.tools.currentTool.onMouseDown(event);
    }
    @HostListener("contextmenu", ["$event"])
    onRightClick(event: MouseEvent): void {
        event.preventDefault();
        this.tools.currentTool.onRightClick(event);
    }

    @HostListener("mouseenter", ["$event"])
    onMouseEnter(event: MouseEvent): void {
        this.tools.currentTool.onMouseEnter(event);
    }

    @HostListener("dblclick", ["$event"])
    onDblClick(event: MouseEvent): void {
        this.tools.currentTool.onDblClick(event);
    }

    @HostListener("click", ["$event"])
    onClick(event: MouseEvent): void {
        if (this.mouseFired) {
            this.mouseFired = false;
            return;
        }
        this.tools.currentTool.onClick(event);
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseUp(event: MouseEvent): void {
        this.tools.currentTool.onMouseUp(event);
    }

    @HostListener("mouseout", ["$event"])
    onMouseOut(event: MouseEvent): void {
        this.tools.currentTool.onMouseOut(event);
    }

    @HostListener("window:popstate", ["$event"])
    onPopState(): void {
        if (window.location.pathname === "/home") {
            location.replace("common-page.component.html");
        }
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }

    getTeamGuessing(): string {
        if (this.classicService.isTeamOneGuessing) {
            return "blue";
        }
        return "red";
    }
}
