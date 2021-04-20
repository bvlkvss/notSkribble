import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CurrentUserService } from "@app/services/current-user/current-user.service";
import {PreviewService} from "@app/services/preview/preview.service";

@Component({
    selector: "app-preview-drawing",
    templateUrl: "./preview-drawing.component.html",
    styleUrls: ["./preview-drawing.component.scss"]
})
export class PreviewDrawingComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<PreviewDrawingComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private previewService: PreviewService,
        public currentUserService: CurrentUserService
    ) { }

    ngOnInit(): void {
        this.previewService.data = this.data;
        this.previewService.valuesForPreview();
    }

    close(): void {
        this.dialogRef.close();
    }

}
