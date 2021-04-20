import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CanvasReorderService } from "@app/services/canvas-reorder/canvas-reorder.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";

@Component({
    selector: "app-draw-image",
    templateUrl: "./draw-image.component.html",
    styleUrls: ["./draw-image.component.scss"]
})
export class DrawImageComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<DrawImageComponent>,
        private drawingService: DrawingService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public gameManagerService: GameManagerService,
        private pencilService: PencilService,
        private canvasReorderService: CanvasReorderService,
        public currentUserService: CurrentUserService
    ) {
        this.isPreview();
    }

    ngOnInit(): void {
        this.isPreview();
    }

    saveDrawing(): void {
        this.drawingService.urlCanvas = this.drawingService.baseCtx.canvas.toDataURL('image/');
        this.canvasReorderService.originalStroke = this.pencilService.createPair;
        this.dialogRef.close();
    }

    close(): void {
        this.dialogRef.close();
    }


    isPreview(): void {
        if (this.data.isPreview) {
            this.gameManagerService.artist = "";
            document.getElementById("preview")?.append(this.data.drawing);
        } else {
            if (this.drawingService.urlCanvas !== undefined) {
                const imagetoload = new Image();
                imagetoload.src = this.drawingService.urlCanvas;
                imagetoload.setAttribute('crossOrigin', "");
                imagetoload.onload = () => {
                    this.drawingService.baseCtx.drawImage(imagetoload, 0, 0);
                };
            }
        }
    }
}
