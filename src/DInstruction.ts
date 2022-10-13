import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class DInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(21, 31, core.getOpCodeMin());
        this._code.setRange(12, 20, values[2]);
        //this.code.setRange(10, 11, 0);
        this._code.setRange(5, 9, values[1]);
        this._code.setRange(0, 4, values[0]);
    }

    public override execute(sim: Simulation): void {
        switch (this._mnemonic) {
            case InstructionMnemonic.LDUR:
                sim.setRegAsNumber(this.getRt(), sim.getMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), 8));
                break;
            case InstructionMnemonic.LDURB:
                sim.setRegAsNumber(this.getRt(), sim.getMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), 1));
                break;
            case InstructionMnemonic.LDURH:
                sim.setRegAsNumber(this.getRt(), sim.getMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), 2));
                break;
            case InstructionMnemonic.LDURSW:
                sim.setRegAsNumber(this.getRt(), sim.getMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), 4));
                break;

            case InstructionMnemonic.STUR:
                sim.setMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), sim.getRegAsNumber(this.getRt()), 8);
                break;
            case InstructionMnemonic.STURB:
                sim.setMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), sim.getRegAsNumber(this.getRt()), 1);
                break;
            case InstructionMnemonic.STURH:
                sim.setMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), sim.getRegAsNumber(this.getRt()), 2);
                break;
            case InstructionMnemonic.STURW:
                sim.setMem(sim.getRegAsNumber(this.getRn()) + this.getDtAddress(), sim.getRegAsNumber(this.getRt()), 4);
                break;

            case InstructionMnemonic.LDA:
                this.fail();
                break;
            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), this.getDtAddress(), this.getOp(), this.getRn(), this.getRt()];
    }

    private getOpcode(): number {
        return this._code.getRange(21, 31);
    }

    private getDtAddress(): number {
        return this._code.getRange(12, 20);
    }

    private getOp(): number {
        return this._code.getRange(10, 11);
    }

    private getRn(): number {
        return this._code.getRange(5, 9);
    }

    private getRt(): number {
        return this._code.getRange(0, 4);
    }
}