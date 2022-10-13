import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class RInstruction extends Instruction {
    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        this._code.setRange(21, 31, core.getOpCodeMin());
        this._code.setRange(16, 20, values[3]);
        this._code.setRange(10, 15, values[2]);
        this._code.setRange(5, 9, values[1]);
        this._code.setRange(0, 4, values[0]);
    }

    public override execute(sim: Simulation): void {
        let left: bigint;
        let right: bigint;
        let result: bigint;

        switch (this._mnemonic) {
            case InstructionMnemonic.ADD:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) + sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.ADDS:
                left = sim.getReg(this.getRn());
                right = sim.getReg(this.getRm());
                result = left + right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.SUB:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) - sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.SUBS:
                left = sim.getReg(this.getRn());
                right = sim.getReg(this.getRm());
                result = left - right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.MUL:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) * sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.UDIV:
                this.fail();
                break;
            case InstructionMnemonic.SDIV:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) / sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.AND:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) & sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.ANDS:
                left = sim.getReg(this.getRn());
                right = sim.getReg(this.getRm());
                result = left & right;

                sim.setReg(this.getRd(), result);
                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.EOR:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) ^ sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.ORR:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) | sim.getReg(this.getRm()));
                break;
            case InstructionMnemonic.LSL:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) << BigInt(this.getShamt()));
                break;
            case InstructionMnemonic.LSR:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()) >> BigInt(this.getShamt()));
                break;
            case InstructionMnemonic.BR:
                sim.branch(sim.getRegAsNumber(this.getRd()));
                break;

            case InstructionMnemonic.CMP:
                left = sim.getReg(this.getRd());
                right = sim.getReg(this.getRn());
                result = left - right;

                sim.setFlags(result, left, right);
                break;
            case InstructionMnemonic.MOV:
                sim.setReg(this.getRd(), sim.getReg(this.getRn()));
                break;
            default:
                this.fail();
                break;
        }
    }

    protected override getCodeValues(): number[] {
        return [this.getOpcode(), this.getRm(), this.getShamt(), this.getRn(), this.getRd()];
    }

    private getOpcode(): number {
        return this._code.getRange(21, 31);
    }

    private getRm(): number {
        return this._code.getRange(16, 20);
    }

    private getShamt(): number {
        return this._code.getRange(10, 15);
    }

    private getRn(): number {
        return this._code.getRange(5, 9);
    }

    private getRd(): number {
        return this._code.getRange(0, 4);
    }
}