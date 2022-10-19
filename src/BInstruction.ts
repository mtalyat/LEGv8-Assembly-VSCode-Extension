import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

/**
 * Branch Instruction.
 */
export class BInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(26, 31, core.getOpCodeMin());
        this._code.setRange(0, 25, values[0]);
    }

    public override execute(sim: Simulation): void {
        switch (this._mnemonic) {
            case InstructionMnemonic.B:
                sim.branch(this.getBrAddress());
                break;
            case InstructionMnemonic.BL:
                sim.setRegAsNumber(Simulation.lrRegister, sim.executionIndex);
                sim.branch(this.getBrAddress());
                break;
            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), this.getBrAddress()];
    }

    private getOpcode(): number {
        return this._code.getRange(26, 31);
    }

    private getBrAddress(): number {
        return this._code.getRange(0, 25);
    }
}