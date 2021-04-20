import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ClassicService } from "@app/services/classic/classic.service";
import * as confetti from "canvas-confetti";

@Component({
    selector: "app-game-dialog",
    templateUrl: "./game-dialog.component.html",
    styleUrls: ["./game-dialog.component.scss"]
})
export class GameDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<GameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public classicService: ClassicService,
    ) { }
    
    ngOnInit(): void {
        if (this.data.message[0] === "endGame" && this.isUserWon()) {
            this.surprise();
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    isUserWon(): boolean {
        return (this.classicService.userTeam === this.data.winner);
    }

    public surprise(): void {
        const canvas = document.getElementById("confetti") as HTMLCanvasElement;
        const myConfetti = confetti.create(canvas, {
            resize: true
        });

        myConfetti(
            {
                particleCount: 200,
                startVelocity: 50,
                spread: 180,
                origin: { y: 0.6 }
            }
        );
    }
}
