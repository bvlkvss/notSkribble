// tslint:disable:no-empty
export abstract class Command {
    isResize: boolean;
    isPencil: boolean;
    execute(): void {}
    unexecute(): void {}
    undoPair(): void {}
    redoPair(): void {}
}
