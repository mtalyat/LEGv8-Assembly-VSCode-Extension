import { CoreInstruction } from "./CoreInstruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { Output } from "./Output";
import { PackedNumber } from "./PackedNumber";
import { Simulation } from "./Simulation";

export class Instruction {

    protected readonly _mnemonic: InstructionMnemonic;

    protected readonly _code: PackedNumber;

    public constructor(core: CoreInstruction, line: Line) {
        // get the mnemonic
        this._mnemonic = line.getLabel().toUpperCase() as InstructionMnemonic;

        // get the argument values
        let values = core.extractArgValuesFromLine(line);

        // pack into data
        this._code = new PackedNumber(0);

        if (values !== undefined) {
            this.setCodes(core, values);
        }
    }

    protected setCodes(core: CoreInstruction, values: number[]): void {
        this._code.setNumber(0);
    }

    public execute(sim: Simulation): void {
        Output.error(`Nothing executed for ${this.toString()}.`);
    }

    protected fail(): void {
        Output.error(`Failed to execute ${this._mnemonic} in ${this.constructor.name}`);
    }

    public getCode(): number {
        return this._code.getNumber();
    }

    public getCodeString(): string {
        return this._code.toString(32);
    }

    protected getCodeValues(): number[] {
        return new Array();
    }

    public toString(): string {
        return `${this._mnemonic.toString().padEnd(6)} ${this.getCodeValues().join(' ')}`;
    }
}