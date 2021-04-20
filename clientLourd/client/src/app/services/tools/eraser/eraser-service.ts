import { Injectable } from "@angular/core";
import { Const } from "@app/classes/constants";
import { EraserCommand } from "@app/classes/eraser-command";
import { Pixel } from "@app/classes/pixel";
import { MouseButton, Tool } from "@app/classes/tool";
import { Vec2 } from "@app/classes/vec2";
import { ClassicService } from "@app/services/classic/classic.service";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { SocketioService } from "@app/services/socketio.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";
import { UndoRedoService } from "@app/services/undo-redo/undo-redo.service";

@Injectable({
    providedIn: "root",
})
export class EraserService extends Tool {
    private pathData: Vec2[];
    public pathToSend: Vec2[] = [];
    private lastEmit: number;
    private imageData: any;
    private currentPath: any[] = [];
    private mapPoint: Map<String, any> = new Map();
    private stackPoint: any[] = [];

    constructor(
        drawingService: DrawingService,
        protected invoker: UndoRedoService,
        private socketService: SocketioService,
        private classicService: ClassicService,
        public pencilService: PencilService
    ) {
        super(drawingService);
        this.toolAttributes = ["eraserWidth"];
        this.lineWidth = Const.MINIMUM_ERASER_SIZE;
        this.clearPath();
        this.lastEmit = Date.now();
    }


    private checkPair(): void {
        let imageData: ImageData = this.drawingService.previewCtx.getImageData(0, 0, 750, 430);
        this.imageData = imageData.data;
        let newArray: any = [];
        this.mapPoint.clear();
        for (let path of this.pencilService.createPair) {
            for (let point of path) {
                if (!this.isWhite(point.point)) {
                    this.mapPoint.set(JSON.stringify(point.point), point);
                }
            }
            let dividedStroke = this.divideStroke();
            for (let element of dividedStroke) {
                newArray.push(element);
            }
        }
        this.pencilService.createPair = newArray;
    }

    private connectPoint(point: Vec2): void {
        let stringPoint = JSON.stringify(point);
        if (this.mapPoint.has(stringPoint)) {
            this.currentPath.push(this.mapPoint.get(stringPoint));
            this.stackPoint.push(point);
            this.mapPoint.delete(stringPoint);
        }
    }

    private divideStroke(): any[] {
        let newArray: any[] = [];
        let currentPoint;
        this.stackPoint = [];
        this.currentPath = [];
        while (this.mapPoint.size !== 0) {
            let stringPoint = this.mapPoint.keys().next().value;
            currentPoint = this.mapPoint.get(stringPoint).point;
            this.currentPath.push(this.mapPoint.get(stringPoint));
            this.stackPoint = [currentPoint];
            this.mapPoint.delete(stringPoint);
            while (this.stackPoint.length !== 0) {
                currentPoint = this.stackPoint.pop();
                this.checkPointAround(currentPoint);
            }
            this.orderPointInPath();
            newArray.push(this.currentPath);
            this.currentPath = [];
        }
        return newArray;
    }

    orderPointInPath(): void {
        let currentPoint = this.currentPath[0].point.x;
        let findAllY = [];
        let newOrder = [];
        while(this.currentPath.length !== newOrder.length){
            findAllY = this.currentPath.filter(x => x.point.x === currentPoint);
            for(let element of findAllY){
                newOrder.push(element);
            }
            currentPoint++;
        }
        this.currentPath = newOrder;
    }


    private isWhite(point: Vec2): boolean {
        let color = this.pencilService.getPixelColor(point, this.imageData);
        return color[0] === 255 && color[1] === 255 && color[2] === 255;
    }


    checkPointAround(currentPoint: Vec2): void {
        let tmp = Object.assign({}, currentPoint);
        tmp.x--;
        tmp.y--;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.y--;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.x++;
        tmp.y--;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.x++;
        tmp.y++;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.x--;
        tmp.y++;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.x--;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.x++;
        this.connectPoint(tmp);
        tmp = Object.assign({}, currentPoint);
        tmp.y++;
        this.connectPoint(tmp);
    }

    onMouseDown(event: MouseEvent): void {
        this.pencilService.savePair.push(this.pencilService.createPair);
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.invoker.ClearRedo();
            this.pencilService.redoStackPair = [];
            this.invoker.setIsAllowed(false);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.pathToSend.push(this.mouseDownCoord);
        }
    }

    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.clearLine(this.drawingService.baseCtx, this.pathData, true);
            this.endLine();
        }
        this.clearPath();
    }

    onMouseEnter(event: MouseEvent): void {
        this.clearPath();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.checkPair();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.baseCtx, this.pathData, true);
            const cmd = new EraserCommand(this.pathData, this, this.drawingService) as EraserCommand;
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
            type: "eraser"
        };
        this.socketService.endLine(data);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathToSend.push(mousePosition);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.previewCtx, this.pathData, false);
        }
    }

    appendIsDrawing(path: Vec2): void {
        if (!this.classicService.isUserDrawing) {
            this.invoker.ClearRedo();
            this.pencilService.redoStackPair = [];
            this.pathData.push(path);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.previewCtx, this.pathData, false);
        }
    }

    appendDrawing(): void {
        if (!this.classicService.isUserDrawing) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearLine(this.drawingService.baseCtx, this.pathData, true);
            const cmd = new EraserCommand(this.pathData, this, this.drawingService) as EraserCommand;
            this.invoker.addToUndo(cmd);
            this.invoker.setIsAllowed(true);
            this.clearPath();
        }
    }

    setLineWidth(thickness: number): void {
        this.lineWidth = this.findMax(thickness, Const.MINIMUM_ERASER_SIZE);
    }

    clearLine(ctx: CanvasRenderingContext2D, path: Vec2[], isDone: boolean): void {
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = "round";
        ctx.canvas.style.cursor = 'url("../../../assets/whiteSquare.png"), auto';
        ctx.strokeStyle = "rgba(255,255,255)";
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
                type: "eraser",
                color: "#FFFFFFFF",
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

    private clearPath(): void {
        this.pathData = [];
        this.pathToSend = [];
    }
}
