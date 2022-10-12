import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class CBInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.CBZ:

                break;
            case InstructionMnemonic.CBNZ:

                break;

            case InstructionMnemonic.B_EQ:

                break;
            case InstructionMnemonic.B_NE:

                break;
            case InstructionMnemonic.B_LT:
            case InstructionMnemonic.B_LO:

                break;
            case InstructionMnemonic.B_LE:
            case InstructionMnemonic.B_LS:

                break;
            case InstructionMnemonic.B_GT:
            case InstructionMnemonic.B_HI:

                break;
            case InstructionMnemonic.B_GE:
            case InstructionMnemonic.B_HS:

                break;
            case InstructionMnemonic.B_PL:

                break;
            case InstructionMnemonic.B_MI:

                break;
            default:
                this.fail();
                break;
        }
    }
}