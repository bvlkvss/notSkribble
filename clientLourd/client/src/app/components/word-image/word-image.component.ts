// Resize of image inspired from this link : https://jsfiddle.net/ascorbic/wn655txt/2/
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatDialog } from "@angular/material/dialog";
import { DrawImageComponent } from "@app/components/word-image/draw-image/draw-image.component";
import { Text } from "@app/enum/text";
import { CanvasReorderService } from "@app/services/canvas-reorder/canvas-reorder.service";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import { DrawingService } from "@app/services/drawing/drawing.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { PreviewService } from "@app/services/preview/preview.service";
import { SocketioService } from "@app/services/socketio.service";
import { SvgArrayService } from "@app/services/svg-array/svg-array.service";
import { WindowManagerService } from "@app/services/window-manager/window-manager.service";
import { PreviewDrawingComponent } from "./preview-drawing/preview-drawing.component";
let potrace = require("potrace");

@Component({
    selector: "app-word-image",
    templateUrl: "./word-image.component.html",
    styleUrls: ["./word-image.component.scss"]
})
export class WordImageComponent implements OnInit {

    public text = Text;
    public wordForm: FormGroup;
    public visible = true;
    selectable = true;
    removable = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    hints: string[] = [];
    selected = -1;
    public difficultyValues: any;
    isDrawingOneTime: boolean = false;
    base64Image: any;

    constructor(
        private formBuilder: FormBuilder,
        public dialog: MatDialog,
        private socketio: SocketioService,
        private svgArrayService: SvgArrayService,
        private canvasReorderService: CanvasReorderService,
        private drawingService: DrawingService,
        private previewService: PreviewService,
        public currentUserService: CurrentUserService,
        public windowManagerService: WindowManagerService,
        private gameManagerService: GameManagerService
    ) {
        this.createwordForm();
        this.reset();
    }

    public colorsMap = new Map([
        ["black", "#000000"],
        ["blue", "#0000ff"],
        ["red", "#ff0000"],
        ["green", "#00ff00"],
        ["orange", "#FF9900"],
        ["pink", "#FF0099"],
        ["purple", "#9900FF"],
        ["white", "#ffffff"]
    ]);


    ngOnInit(): void {
        this.gameManagerService.mode = "";
        this.gameManagerService.artist = this.currentUserService.getUser();
        this.reset();
    }

    reset(): void {
        this.wordForm.reset();
        Object.keys(this.wordForm.controls).forEach(key => {
            this.wordForm.get(key)?.setErrors(null);
        });
        this.drawingService.urlCanvas = "";
        this.previewService.reset();
        this.hints = [];
        document.getElementById("chipList")?.focus();
        document.getElementById("chipList")?.blur();
        this.wordForm.get("language")?.setValue("fr");
        this.wordForm.get("difficulty")?.setValue("easy");
        this.wordForm.get("drawing")?.setValue("draw");
        this.wordForm.get("mode")?.setValue("conventional");
        this.wordForm.get("center")?.setValue("inside");
        this.wordForm.get("panoramic")?.setValue("left");
        this.changeRadioText();
    }

    submit(): void {
        this.isDrawingOneTime = false;
        this.drawingService.urlCanvas = "";
        this.reorderStroke();
        let data = {
            word: this.wordForm.get("name")?.value,
            lang: this.wordForm.get("language")?.value,
            hints: this.wordForm.get("hints")?.value,
            difficulty: this.wordForm.get("difficulty")?.value,
            random: this.wordForm.get("mode")?.value === "random",
            type: this.wordForm.get("drawing")?.value
        };

        if (this.wordForm.get("drawing")?.value === "insert") {
            Object.assign(data,
                {
                    lines: this.svgArrayService.imageSVG,
                    line_color: this.wordForm.get("color")?.value,
                    background: this.wordForm.get("bgColor")?.value
                }
            );
        } else {
            Object.assign(data,
                {
                    lines: this.canvasReorderService.modifiedStrokes,
                    line_color: "",
                    background: "#ffffff"
                }
            );
        }
        this.socketio.createPair(data);
        this.reset();
    }

    isSubmit(): boolean {
        if (this.wordForm.get("drawing")?.value === "draw") {
            return !this.wordForm.invalid && this.isDrawingOneTime;
        }
        return !this.wordForm.invalid;
    }

    isInsertImage(): boolean {
        if (this.wordForm.get("drawing")?.value === "insert" && this.wordForm.get("mode")?.value === "conventional") {
            this.wordForm.get("mode")?.setValue("random");
        }
        return this.wordForm.get("drawing")?.value === "insert";
    }

    private createwordForm(): void {
        this.wordForm = this.formBuilder.group({
            name: new FormControl("", [Validators.required]),
            language: new FormControl("", [Validators.required]),
            hints: new FormControl([], [Validators.required]),
            difficulty: new FormControl("", [Validators.required]),
            drawing: new FormControl("", [Validators.required]),
            mode: new FormControl("", [Validators.required]),
            center: new FormControl("", []),
            panoramic: new FormControl("", []),
            color: new FormControl("", []),
            bgColor: new FormControl("", []),
            threshold: new FormControl("", [
                Validators.min(0),
                Validators.max(255),
            ]),
            image: new FormControl("", [])
        });
    }

    addHint(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || "").trim()) {
            this.hints.push(value.trim());
            this.wordForm.get("hints")?.setValue(this.hints);
        }
        input.value = "";
    }

    removeHint(hint: string): void {
        const index = this.hints.indexOf(hint);

        if (index >= 0) {
            this.hints.splice(index, 1);
            this.wordForm.get("hints")?.setValue(this.hints);
        }
    }

    changeRadioText(): void {
        if (this.wordForm.get("difficulty")?.value === "easy") {
            this.difficultyValues = {
                speed: 60,
                time: 90,
                tries: 6

            };
        } else if (this.wordForm.get("difficulty")?.value === "medium") {
            this.difficultyValues = {
                speed: 40,
                time: 60,
                tries: 4
            };
        } else {
            this.difficultyValues = {
                speed: 15,
                time: 30,
                tries: 2
            };
        }
    }

    openDrawing(): void {
        this.isDrawingOneTime = true;
        this.gameManagerService.artist = this.currentUserService.getUser();
        this.dialog.open(DrawImageComponent, {
            disableClose: true,
            data: {
                isPreview: false,
                drawing: null
            }
        });
    }

    canPreview(): boolean {
        if (this.wordForm.get("drawing")?.value === "draw") {
            return this.isDrawingOneTime;
        } else {
            return (this.wordForm.get("image")?.value !== "") && (this.wordForm.get("threshold")?.value !== "") && (this.wordForm.get("color")?.value !== "") && (this.wordForm.get("bgColor")?.value !== "");
        }
    }

    reorderStroke(): void {
        if (this.wordForm.get("drawing")?.value === "insert") {
            if (this.wordForm.get("mode")?.value === "panoramic") {
                this.svgArrayService.reorderStroke(this.wordForm.get("mode")?.value, this.wordForm.get("panoramic")?.value);
            } else if (this.wordForm.get("mode")?.value === "center") {
                this.svgArrayService.reorderStroke(this.wordForm.get("mode")?.value, this.wordForm.get("center")?.value);
            } else {
                this.svgArrayService.reorderStroke(this.wordForm.get("mode")?.value);
            }
        } else {
            this.canvasReorderService.modifiedStrokes = this.canvasReorderService.originalStroke;
            if (this.wordForm.get("mode")?.value === "panoramic") {
                this.canvasReorderService.reorderStroke(this.wordForm.get("mode")?.value, this.wordForm.get("panoramic")?.value);
            } else if (this.wordForm.get("mode")?.value === "center") {
                this.canvasReorderService.reorderStroke(this.wordForm.get("mode")?.value, this.wordForm.get("center")?.value);
            } else {
                this.canvasReorderService.reorderStroke(this.wordForm.get("mode")?.value);
            }
        }
    }

    preview(): void {
        if (this.wordForm.get("drawing")?.value === "insert") {
            this.reorderStroke();
            this.dialog.open(PreviewDrawingComponent, {
                disableClose: true,
                data: {
                    background: this.wordForm.get("bgColor")?.value,
                    color: this.wordForm.get("color")?.value,
                    drawing: this.svgArrayService.combinePath(this.svgArrayService.imageSVG),
                    isSVG: true
                }
            });

        } else {
            this.reorderStroke();
            this.dialog.open(PreviewDrawingComponent, {
                disableClose: true,
                data: {
                    background: "",
                    color: "",
                    isSVG: false
                }
            });
        }
    }

    loadImage(event: any): void {
        let rawFile = event.target.files[0] as any;
        this.resizeImage(rawFile, 750, 430).then(any => {
        });
    }

    // Resize of image inspired from this link : https://jsfiddle.net/ascorbic/wn655txt/2/
    resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<any> {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.src = URL.createObjectURL(file);
            image.onload = () => {
                let width = image.width;
                let height = image.height;

                if (width <= maxWidth && height <= maxHeight) {
                    resolve(file);
                }

                let newWidth;
                let newHeight;

                if (width > height) {
                    newHeight = height * (maxWidth / width);
                    newWidth = maxWidth;
                } else {
                    newWidth = width * (maxHeight / height);
                    newHeight = maxHeight;
                }

                let canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;

                let context = canvas.getContext('2d');

                context?.drawImage(image, 0, 0, newWidth, newHeight);
                this.base64Image = canvas.toDataURL();
                this.doPotrace();
            };
            image.onerror = reject;
        });
    }

    async doPotrace() {
        var params = {
            background: this.wordForm.get("bgColor")?.value,
            color: this.wordForm.get("color")?.value,
            threshold: this.wordForm.get("threshold")?.value
        };

        await potrace.posterize(this.base64Image, params, (err: any, svg: string) => {
            if (err) console.log(err);
            this.svgArrayService.svgToArray(svg);
        });
    }
}