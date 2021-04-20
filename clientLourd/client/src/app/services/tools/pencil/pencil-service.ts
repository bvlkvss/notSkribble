import { Injectable } from "@angular/core";
import { Const } from "@app/classes/constants";
import { ImageDataCustom } from "@app/classes/image-data";
import { PencilCommand } from "@app/classes/pencil-command";
import { Pixel } from "@app/classes/pixel";
import { MouseButton, Tool } from "@app/classes/tool";
import { Vec2 } from "@app/classes/vec2";
import { ClassicService } from "@app/services/classic/classic.service";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { SocketioService } from "@app/services/socketio.service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Injectable({
    providedIn: "root",
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    public pathToSend: Vec2[] = [];
    private lastEmit: number;
    public createPair: any;
    public savePair: any[] = [];
    public redoStackPair: any[] = [];

    constructor(
        public drawingService: DrawingService,
        protected invoker: UndoRedoService,
        private socketService: SocketioService,
        public classicService: ClassicService
    ) {
        super(drawingService);

        this.toolAttributes = ["lineWidth"];
        this.lineWidth = Const.DEFAULT_PENCIL_WIDTH;
        this.clearPath();
        this.lastEmit = Date.now();
        this.pathData = [];
        this.createPair = [];
    }

    addToPair(): void {
        let tmp = new Set<ImageDataCustom>();
        let imageData: ImageData = this.drawingService.previewCtx.getImageData(0, 0, 750, 430);
        let data = imageData.data;
        let color;
        for (let i = 0; i < 750; i++) {
            for (let j = 0; j < 430; j++) {
                color = this.getPixelColor({ x: i, y: j }, data);
                if (!this.isWhite(color[0], color[1], color[2]) && !this.isNull(color[3])){
                    tmp = this.addPoint({ x: i, y: j }, color, tmp);
                }
            }
        }

        this.createPair.push(Array.from(tmp));
    }

    private addPoint(point: Vec2, color: number[], tmp: Set<ImageDataCustom>): Set<ImageDataCustom> {
        let data: ImageDataCustom = {
            width: this.lineWidth,
            point: point,
            r: color[0],
            g: color[1],
            b: color[2],
            a: color[3]
        };
        tmp.add(data);
        return tmp;
    }

    private isWhite(r: number, g: number, b: number): boolean {
        return r === 255 && g === 255 && b === 255;
    }

    private isNull(a: number): boolean {
        return a === 0;
    }

    getPixelColor(point: Vec2, imageData: any): number[] {
        let color: number[] = [];
        let first = point.y * 750 * 4 + point.x * 4;
        color.push(imageData[first]);
        color.push(imageData[first + 1]);
        color.push(imageData[first + 2]);
        color.push(imageData[first + 3]);
        return color;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.invoker.ClearRedo();
            this.redoStackPair = [];
            this.invoker.setIsAllowed(false);
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathToSend.push(this.mouseDownCoord);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.addToPair();
            this.drawLine(this.drawingService.baseCtx, this.pathData, true);
            this.endLine();
        }
        this.clearPath();
    }

    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.addToPair();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx, this.pathData, true);
            const cmd = new PencilCommand(this.pathData, this, this.drawingService) as PencilCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
            this.endLine();
        }
        this.mouseDown = false;
        this.clearPath();
    }

    endLine(): void {
        let data = {
            name: this.classicService.nameGame,
            type: "pencil"
        };
        this.socketService.endLine(data);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathToSend.push(mousePosition);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData, false);
        }
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    appendIsDrawing(path: Vec2): void {
        if (!this.classicService.isUserDrawing) {
            this.invoker.ClearRedo();
            this.redoStackPair = [];
            this.invoker.setIsAllowed(false);
            this.pathData.push(path);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData, false);
        }
    }

    appendDrawing(): void {
        if (!this.classicService.isUserDrawing) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx, this.pathData, true);
            const cmd = new PencilCommand(this.pathData, this, this.drawingService) as PencilCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
            this.clearPath();
        }
    }

    clearCanvas(): void {
        this.drawingService.clearCanvasWhite(this.drawingService.baseCtx);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[], isDone: boolean): void {
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = this.primaryColor;
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        if (this.classicService.isUserDrawing && isDone) {
            this.sendToClient(isDone);
        } else if (this.classicService.isUserDrawing && Date.now() - this.lastEmit >= 10) {
            this.sendToClient(isDone);
        }
        ctx.stroke();
    }

    sendToClient(isDone: boolean): void {
        let point: Pixel;
        let pixels: Pixel[] = [];
        for (let pixel of this.pathToSend) {
            point = {
                type: "pencil",
                color: "#" + this.primaryColor.substring(7, 9) + this.primaryColor.substring(1, 7),
                width: this.lineWidth,
                isDone: isDone,
                positionX: pixel.x,
                positionY: pixel.y
            };
            pixels.push(point);
        }
        this.pathToSend = [];
        let data = {
            name: this.classicService.nameGame,
            info: pixels
        };
        this.socketService.sendPixel(data);
        this.lastEmit = Date.now();
    }

    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }

    private clearPath(): void {
        this.pathData = [];
        this.pathToSend = [];
    }
}
