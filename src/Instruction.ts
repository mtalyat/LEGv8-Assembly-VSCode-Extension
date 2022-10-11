import { Line } from "./Line";

export class Instruction {
    private _line: Line;

    public constructor(line: Line) {
        this._line = line;
    }

    public toString(): string {
        return this._line.toString();
    }
}