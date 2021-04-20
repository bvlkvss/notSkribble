import { Injectable } from "@angular/core";
import { Tool } from "@app/classes/tool";
import { EraserService } from "@app/services/tools/eraser/eraser-service";
import { GridService } from "@app/services/tools/grid/grid.service";
import { PencilService } from "@app/services/tools/pencil/pencil-service";

@Injectable({
    providedIn: "root",
})
export class ToolsManagerService {
    public tools: Map<string, Tool>;
    currentTool: Tool;
    color: string;

    constructor(
        pencilService: PencilService,
        eraserService: EraserService,
        gridService: GridService,
 
    ) {
        this.tools = new Map<string, Tool>([
            ["pencil", pencilService],
            ["eraser", eraserService],
            ["grid", gridService],
        ]);
        this.currentTool = this.tools.get("pencil") as Tool;
    }

    getByValue(searchValue: Tool): string {
        let toolname = "";
        for (const [key, value] of this.tools.entries()) {
            if (value === searchValue) toolname = key;
        }
        return toolname;
    }

    setTools(name: string): void {
        this.currentTool = this.tools.get(name) as Tool;
    }

    getTools(): Map<string, Tool> {
        return this.tools;
    }

    setLineWidth(lineWidth: number): void {
        this.currentTool.setLineWidth(lineWidth);
    }

    setColor(color: string, isPrimary: boolean): void {
        if (isPrimary){ 
            this.tools.forEach((element) => {
                element.setPrimaryColor(color);
            });
            this.color = color;
        }
        else
            this.tools.forEach((element) => {
                element.setSecondaryColor(color);
            });
    }

}
