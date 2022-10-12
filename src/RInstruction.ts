import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class RInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.ADD:

                break;
            case InstructionMnemonic.ADDS:

                break;
            case InstructionMnemonic.SUB:

                break;
            case InstructionMnemonic.SUBS:

                break;
            case InstructionMnemonic.MUL:

                break;
            case InstructionMnemonic.UDIV:

                break;
            case InstructionMnemonic.SDIV:

                break;
            case InstructionMnemonic.AND:

                break;
            case InstructionMnemonic.ANDS:

                break;
            case InstructionMnemonic.EOR:

                break;
            case InstructionMnemonic.ORR:

                break;
            case InstructionMnemonic.LSL:

                break;
            case InstructionMnemonic.LSR:

                break;
            case InstructionMnemonic.BR:

                break;
            case InstructionMnemonic.FADDS:

                break;

            case InstructionMnemonic.CMP:

                break;
            case InstructionMnemonic.MOV:

                break;
            default:
                this.fail();
                break;
        }
    }
}