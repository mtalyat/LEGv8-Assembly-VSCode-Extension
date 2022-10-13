import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class CBInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(24, 31, core.getOpCodeMin());
        this._code.setRange(5, 23, values[1]);
        this._code.setRange(0, 4, values[0]);
    }

    public override execute(sim: Simulation): void {
        switch (this._mnemonic) {
            case InstructionMnemonic.CBZ:
                if (sim.getReg(this.getRt()) === 0) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.CBNZ:
                if (sim.getReg(this.getRt()) !== 0) {
                    sim.branch(this.getCondBrAddress());
                }
                break;

            case InstructionMnemonic.B_EQ:
                if (sim.zeroFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_NE:
                if (!sim.zeroFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_LT:
            case InstructionMnemonic.B_LO:
                if (!sim.zeroFlag() && sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_LE:
            case InstructionMnemonic.B_LS:
                if (sim.zeroFlag() || sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_GT:
            case InstructionMnemonic.B_HI:
                if (!sim.zeroFlag() && !sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_GE:
            case InstructionMnemonic.B_HS:
                if (sim.zeroFlag() || sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_PL:
                if (!sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            case InstructionMnemonic.B_MI:
                if (sim.negativeFlag()) {
                    sim.branch(this.getCondBrAddress());
                }
                break;
            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), this.getCondBrAddress(), this.getRt()];
    }

    private getOpcode(): number {
        return this._code.getRange(24, 31);
    }

    private getCondBrAddress(): number {
        return this._code.getRange(5, 23);
    }

    private getRt(): number {
        return this._code.getRange(0, 4);
    }
}