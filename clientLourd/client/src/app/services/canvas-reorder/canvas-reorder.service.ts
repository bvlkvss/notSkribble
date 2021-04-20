import { Injectable } from "@angular/core";
import { SvgArrayService } from "@app/services/svg-array/svg-array.service";

@Injectable({
    providedIn: "root"
})
export class CanvasReorderService {
    public originalStroke: any[] = [];
    public modifiedStrokes: any[] = [];

    constructor(
        private svgArrayService: SvgArrayService
    ) { }

    reorderStroke(mode: string, secondOption?: string): void {
        switch (mode) {
            case "conventional":
                this.modifiedStrokes = this.originalStroke;
                break;
            case "random":
                this.random();
                break;
            case "panoramic":
                switch (secondOption) {
                    case "left":
                        this.leftToRight();
                        break;
                    case "right":
                        this.rightToLeft();
                        break;
                    case "top":
                        this.topToBottom();
                        break;
                    case "bottom":
                        this.bottomToTop();
                        break;

                    default:
                        break;
                }
                break;
            case "center":
                if (secondOption === "inside") {
                    this.insideToOutside();
                } else {
                    this.outisdeToInside();
                }
                break;

            default:
                break;
        }
    }

    private outisdeToInside() {
        this.insideToOutside();
        this.modifiedStrokes.reverse();
    }

    private insideToOutside() {
        let mapOrder = new Map();

        for (let path of this.modifiedStrokes) {
            let min = this.getMinDist(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.modifiedStrokes = Array.from(orderedMap.values());
    }

    private getMinDist(path: any[]): number {
        let minX = path[0].point.x;
        let minY = path[0].point.y;
        let minDist = this.svgArrayService.calculateDist(minX, minY), tmp;
        for (let point of path) {
            minX = point.point.x;
            minY = point.point.y;
            tmp = this.svgArrayService.calculateDist(minX, minY);
            if (tmp < minDist) minDist = tmp;
        }
        return minDist;
    }

    private bottomToTop() {
        this.topToBottom();
        this.modifiedStrokes.reverse();
    }

    private topToBottom() {
        let mapOrder = new Map();

        for (let path of this.originalStroke) {
            let min = this.getMinYValue(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.modifiedStrokes = Array.from(orderedMap.values());
    }

    private rightToLeft() {
        this.leftToRight();
        this.modifiedStrokes.reverse();
    }

    private leftToRight() {
        let mapOrder = new Map();

        for (let path of this.originalStroke) {
            let min = this.getMinXValue(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.modifiedStrokes = Array.from(orderedMap.values());
    }

    private random() {
        let current = this.modifiedStrokes.length;
        let tmpValue, random;

        while (current !== 0) {
            random = Math.floor(Math.random() * current);
            current--;

            tmpValue = this.modifiedStrokes[current];
            this.modifiedStrokes[current] = this.modifiedStrokes[random];
            this.modifiedStrokes[random] = tmpValue;
        }
    }


    private getMinXValue(path: any[]): number {
        let min = path[0].point.x;
        for (let point of path) {
            if (point.point.x < min) min = point.point.x;
        }
        return min;
    }

    private getMinYValue(path: any[]): number {
        let min = path[0].point.y;
        for (let point of path) {
            if (point.point.y < min) min = point.point.y;
        }
        return min;
    }

}
