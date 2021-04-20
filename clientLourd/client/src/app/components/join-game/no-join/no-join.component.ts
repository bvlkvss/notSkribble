import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-no-join",
    templateUrl: "./no-join.component.html",
    styleUrls: ["./no-join.component.scss"]
})
export class NoJoinComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<NoJoinComponent>
    ) { }

    ngOnInit(): void {
    }

    close(): void {
        this.dialogRef.close();
    }
}
