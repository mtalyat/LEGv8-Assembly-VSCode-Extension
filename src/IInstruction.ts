import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class IInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(22, 31, core.getOpCodeMin());
        this._code.setRange(10, 21, values[2]);
        this._code.setRange(5, 9, values[1]);
        this._code.setRange(0, 4, values[0]);
    }

    public override execute(sim: Simulation): void {
        let left: bigint;
        let right: bigint;
        let result: bigint;

        switch (this._mnemonic) {
            case InstructionMnemonic.ADDI:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) + this.getAluImmediate());
                break;
            case InstructionMnemonic.ADDIS:
                left = sim.getReg(this.getRn());
                right = this.getAluImmediate();
                result = left + right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.SUBI:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) - this.getAluImmediate());
                break;
            case InstructionMnemonic.SUBIS:
                left = sim.getReg(this.getRn());
                right = this.getAluImmediate();
                result = left - right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.ANDI:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) & this.getAluImmediate());
                break;
            case InstructionMnemonic.ANDIS:
                left = sim.getReg(this.getRn());
                right = this.getAluImmediate();
                result = left & right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.EORI:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) ^ this.getAluImmediate());
                break;
            case InstructionMnemonic.ORRI:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) | this.getAluImmediate());
                break;

            case InstructionMnemonic.CMPI:
                left = sim.getReg(this.getRn());
                right = this.getAluImmediate();
                result = left - right;

                sim.setFlags(result, left, right);
                break;
            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), Number(this.getAluImmediate()), this.getRn(), this.getRd()];
    }

    private getOpcode(): number {
        return this._code.getRange(22, 31);
    }

    private getAluImmediate(): bigint {
        return BigInt(this._code.getRange(10, 21));
    }

    private getRn(): number {
        return this._code.getRange(5, 9);
    }

    private getRd(): number {
        return this._code.getRange(0, 4);
    }
}