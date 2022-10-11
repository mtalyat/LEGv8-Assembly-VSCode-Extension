import { Instruction } from "./Instruction";

export class Simulation {
    public static readonly registerCount: number = 32;

    public static readonly memorySize: number = 4096;

    public static readonly xzrRegister: number = this.registerCount - 1;
    public static readonly lrRegister: number = this.registerCount - 2;
    public static readonly fpRegister: number = this.registerCount - 3;
    public static readonly spRegister: number = this.registerCount - 4;
    public static readonly ip0Register: number = 16;
    public static readonly ip1Register: number = 17;

    private _instructions: Instruction[];

    public constructor(instructions: Instruction[]) {
        this._instructions = instructions;
    }

    public print() {
        console.log("Printing sim.\n" + this._instructions.map(function (val, index) {
            return val.toString();
        }).join('\n'));
    }
}