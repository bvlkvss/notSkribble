import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Const } from './constants';
// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
// tslint:disable:no-empty
export abstract class Tool {
    static shouldAlign: boolean;
    toolAttributes: string[];
    mouseDownCoord: Vec2;
    mouseDown: boolean;
    mouseOutCoord: Vec2;
    lineWidth: number;
    currentPos: Vec2;
    isOut: boolean;
    width: number;
    height: number;
    opacity: number;
    primaryColor: string;
    secondaryColor: string;

    constructor(protected drawingService: DrawingService) {
        this.isOut = false;
        this.mouseDown = false;
        this.primaryColor = Const.DEFAULT_COLOR;
        this.secondaryColor = Const.DEFAULT_COLOR;
    }

    setMouseDown(bool: boolean): void {
        this.mouseDown = bool;
    }
    onClick(event: MouseEvent): void {}
    onMouseDown(event: MouseEvent): void {}
    onRightClick(event: MouseEvent): void {}
    onDblClick(event: MouseEvent): void {}
    onMouseUp(event: MouseEvent): void {}
    onMouseOut(event: MouseEvent): void {}
    onMouseEnter(event: MouseEvent): void {}
    onKeyDown(event: KeyboardEvent): void {}
    onMouseMove(event: MouseEvent): void {}
    onKeyUp(event: KeyboardEvent): void {}
    setPrimaryColor(color: string): void {}
    setSecondaryColor(color: string): void {}
    setLineWidth(value: number): void {}

    findMax(leftBound: number, rightBound: number): number {
        return Math.max(leftBound, rightBound);
    }
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    hexToColor(hex: string): Color {
        const redNum = parseInt(hex.slice(1, Const.RED_END_RANGE), Const.RADIX_HEX);
        const greenNum = parseInt(hex.slice(Const.RED_END_RANGE, Const.GREEN_END_RANGE), Const.RADIX_HEX);
        const blueNum = parseInt(hex.slice(Const.GREEN_END_RANGE, Const.BLUE_END_RANGE), Const.RADIX_HEX);
        const opacityNum = parseInt(hex.slice(Const.BLUE_END_RANGE, Const.OPACITY_END_RANGE), Const.RADIX_HEX);
        const color: Color = { red: redNum, green: greenNum, blue: blueNum, opacity: opacityNum };
        return color;
    }
    getLineWidth(): number {
        return this.lineWidth;
    }

    protected getMax(arr: number[]): number {
        let len = arr.length;
        let max = -Infinity;
        while (len--) {
            max = arr[len] > max ? arr[len] : max;
        }
        return max;
    }

    protected getMin(arr: number[]): number {
        let len = arr.length;
        let min = Infinity;

        while (len--) {
            min = arr[len] < min ? arr[len] : min;
        }
        return min;
    }

}
