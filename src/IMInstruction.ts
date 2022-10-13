import { CodeAction } from "vscode";
import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class IMInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(21, 31, core.getOpCodeMin());
        this._code.setRange(5, 20, values[1]);
        this._code.setRange(0, 4, values[0]);
    }

    public override execute(sim: Simulation): void {
        switch (this._mnemonic) {
            case InstructionMnemonic.MOVK:
                let r = this.getRd();
                sim.setReg(r, (sim.getReg(r) & (~0n << 16n)) | BigInt(this.getMovImmediate()));
                break;
            case InstructionMnemonic.MOVZ:
                sim.setReg(this.getRd(), BigInt(this.getMovImmediate()));
                break;

            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), this.getMovImmediate(), this.getRd()];
    }

    private getOpcode(): number {
        return this._code.getRange(21, 31);
    }

    private getMovImmediate(): number {
        return this._code.getRange(5, 20);
    }

    private getRd(): number {
        return this._code.getRange(0, 4);
    }
}