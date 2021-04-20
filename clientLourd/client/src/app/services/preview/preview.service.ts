import { Injectable } from "@angular/core";
import { CanvasReorderService } from "@app/services/canvas-reorder/canvas-reorder.service";
import { ToolsManagerService } from "@app/services/tools-manager/tools-manager.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";
import { GameManagerService } from "../game-manager/game-manager.service";

@Injectable({
    providedIn: "root"
})
export class PreviewService {
    ctx: any;
    current: number = 0;
    nPixelsDisplay: number = 0;
    canvasArray: any[] = [];
    dataDrawing: string[] = [];
    data: any;
    interval: any;

    constructor(
        private pencilService: PencilService,
        public toolsManagerService: ToolsManagerService,
        private canvasReorderService: CanvasReorderService,
        private gameManagerService: GameManagerService
    ) { }


    reset(): void {
        this.canvasArray = [];
        this.dataDrawing = [];
        this.canvasReorderService.modifiedStrokes = [];
        this.canvasReorderService.originalStroke = [];
        this.pencilService.createPair = [];
        this.pencilService.redoStackPair = [];
        this.pencilService.savePair = [];
    }

    combineSVGPath(img: any): string[] {
        let final = [];
        final = img[0];
        for (let i = 1; i < img.length; i++) {
            for (let j = 0; j < img[i].length; j++) {
                final.push(img[i][j]);
            }
        }
        return final;
    }

    valuesForPreview(): void {
        this.current = 0;
        let canvas = document.getElementById("preview") as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.dataDrawing = this.data.drawing;
        if (this.data.isSVG) {
            this.nPixelsDisplay = Math.floor(this.dataDrawing.length / 10 / 10);
            if (this.nPixelsDisplay < 1) {
                this.nPixelsDisplay = 1;
            }
            this.setColor(this.data.background, this.data.color);
            this.drawSVGImage();
        } else {
            this.combinePath();
            this.nPixelsDisplay = Math.floor(this.canvasArray.length / 10 / 10) - 1;
            if (this.nPixelsDisplay < 20) {
                this.nPixelsDisplay = 20;
            }
            this.drawCanvas();
        }
    }

    resetPreviewCanvas(): void {
        let canvas = document.getElementById("preview") as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, canvas?.width, canvas?.height);
    }

    setValues(type: string, line: any[], bg: string, lineColor: string, drawingTime: number): void {
        this.current = 0;
        this.resetPreviewCanvas();

        if (type === "insert") {
            this.dataDrawing = this.combineSVGPath(line);
            this.nPixelsDisplay = Math.floor(this.dataDrawing.length / drawingTime / 10);
            if (this.nPixelsDisplay <= 1) {
                this.nPixelsDisplay = 1;
            }
            this.setColor(bg, lineColor);
            this.drawSVGImage();
        } else {
            this.canvasReorderService.modifiedStrokes = line;
            this.canvasArray = [];
            this.combinePath();
            this.nPixelsDisplay = Math.floor(this.canvasArray.length / drawingTime / 10) - 1;
            if (this.nPixelsDisplay <= 20) {
                this.nPixelsDisplay = 20;
            }
            this.drawCanvas();
        }
    }

    combinePath() {
        for (let path of this.canvasReorderService.modifiedStrokes) {
            for (let point of path) {
                this.canvasArray.push(point);
            }
        }
    }

    async drawCanvas() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                let endPoint = this.current + this.nPixelsDisplay;
                if (endPoint > this.canvasArray.length) {
                    endPoint = this.canvasArray.length;
                }
                this.drawImageCanvas(this.current, endPoint);
                this.current += this.nPixelsDisplay;
                if (endPoint === this.canvasArray.length || this.gameManagerService.isGuessed) {
                    clearInterval(this.interval);
                }
            }, 100);
        });
    }

    private drawImageCanvas(start: number, end: number): void {
        for (let i = start; i < end; i++) {
            let point = this.canvasArray[i];
            this.ctx.fillStyle = "rgba(" + point.r + "," + point.g + "," + point.b + "," + (point.a / 255) + ")";
            this.ctx.fillRect(point.point.x, point.point.y, 1, 1);
        }
    }


    private setColor(colorBg: string, color: string): void {
        this.ctx.fillStyle = colorBg;
        this.ctx.fillRect(0, 0, 750, 430);
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = color;
    }


    private drawImage(start: number, end: number): void {
        for (let i = start; i < end; i++) {
            let path = new Path2D(this.dataDrawing[i]);
            this.ctx.stroke(path);
        }
    }

    async drawSVGImage() {
        return await new Promise(resolve => {
            if (this.interval !== undefined) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                let endPoint = this.current + this.nPixelsDisplay;
                if (endPoint > this.dataDrawing.length) {
                    endPoint = this.dataDrawing.length;
                }
                this.drawImage(this.current, endPoint);
                this.current += this.nPixelsDisplay;
                if (endPoint === this.dataDrawing.length || this.gameManagerService.isGuessed) {
                    clearInterval(this.interval);
                }

            }, 100);
        });
    }

}
