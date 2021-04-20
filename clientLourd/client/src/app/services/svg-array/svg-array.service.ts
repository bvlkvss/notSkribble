import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class SvgArrayService {
    public imageSVG: string[][];

    constructor() { }

    svgToArray(svg: string): void {
        let array = svg.split("<path");

        this.imageSVG = [];

        for (let i = 1; i < array.length; i++) {
            this.imageSVG.push(this.getPath(array[i]));
        }
    }

    private getPoints(element: string): string[] {
        let array = element.split('d="');
        array = array[1].split(/(?=[MCL] )/);
        return array;
    }

    private getPath(element: string): string[] {
        let arr = this.getPoints(element);
        arr = this.removeEndPath(arr);
        arr = this.addMoveToEachPath(arr);
        return arr;
    }

    private removeEndPath(array: string[]): string[] {
        let allo = array[array.length - 1].split('"');
        array[array.length - 1] = allo[0];
        return array;
    }

    private addMoveToEachPath(array: string[]): string[] {
        for (let i = 0; i < array.length; i++) {
            if (!array[i].startsWith("M")) {
                let tmp = array[i - 1].split(" ");
                array[i] = "M " + tmp[tmp.length - 3] + " " + tmp[tmp.length - 2] + " " + array[i];
            }
        }
        return array;
    }

    combinePath(img: any): void {
        let final = [];
        final = img[0];
        for (let i = 1; i < img.length; i++) {
            for (let j = 0; j < img[i].length; j++) {
                final.push(img[i][j]);
            }
        }
        return final;
    }


    reorderStroke(mode: string, secondOption?: string): void {
        switch (mode) {
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

    private rightToLeft(): void {
        this.leftToRight();
        this.imageSVG.reverse();
    }

    private leftToRight(): void {
        let mapOrder = new Map();

        for (let path of this.imageSVG) {
            let min = this.getMinValueX(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.imageSVG = Array.from(orderedMap.values());
    }

    private topToBottom(): void {
        let mapOrder = new Map();

        for (let path of this.imageSVG) {
            let min = this.getMinValueY(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.imageSVG = Array.from(orderedMap.values());
    }

    private insideToOutside(): void {
        let mapOrder = new Map();

        for (let path of this.imageSVG) {
            let min = this.getMinDist(path);
            if (mapOrder.has(min)) {
                min += 0.001;
            }
            mapOrder.set(min, path);
        }

        var orderedMap = new Map([...mapOrder.entries()].sort());
        this.imageSVG = Array.from(orderedMap.values());
    }

    private outisdeToInside(): void {
        this.insideToOutside();
        this.imageSVG.reverse();
    }

    private bottomToTop(): void {
        this.topToBottom();
        this.imageSVG.reverse();
    }

    private getMinValueY(path: string[]): number {
        return this.getMinValue(2, path);
    }

    private getMinValueX(path: string[]): number {
        return this.getMinValue(1, path);
    }

    private getMinValue(dimension: number, path: string[]): number {
        let min = this.getFirstNumber(path[0], dimension);
        for (let point of path) {
            if (this.getFirstNumber(point, dimension) < min) min = this.getFirstNumber(point, dimension);
        }
        return min;
    }

    private getMinDist(path: string[]): number {
        let minX = this.getFirstNumber(path[0], 1);
        let minY = this.getFirstNumber(path[0], 2);
        let minDist = this.calculateDist(minX, minY), tmp;
        for (let point of path) {
            minX = this.getFirstNumber(point, 1);
            minY = this.getFirstNumber(point, 2);
            tmp = this.calculateDist(minX, minY);
            if (tmp < minDist) minDist = tmp;
        }
        return minDist;
    }

    calculateDist(x: number, y: number): number {
        return Math.sqrt(Math.pow(750 / 2 - x, 2) + Math.pow(430 / 2 - y, 2));
    }

    getFirstNumber(point: string, dimension: number): number {
        let sPoint = point.split(" ");
        return +sPoint[dimension];
    }

    private random(): void {
        let current = this.imageSVG.length;
        let tmpValue, random;

        while (current !== 0) {
            random = Math.floor(Math.random() * current);
            current--;

            tmpValue = this.imageSVG[current];
            this.imageSVG[current] = this.imageSVG[random];
            this.imageSVG[random] = tmpValue;
        }
    }
}
