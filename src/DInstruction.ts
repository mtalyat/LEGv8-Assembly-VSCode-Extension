import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class DInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.LDUR:

                break;
            case InstructionMnemonic.LDURB:

                break;
            case InstructionMnemonic.LDURH:

                break;
            case InstructionMnemonic.LDURSW:

                break;

            case InstructionMnemonic.STUR:

                break;
            case InstructionMnemonic.STURB:

                break;
            case InstructionMnemonic.STURH:

                break;
            case InstructionMnemonic.STURW:

                break;

            case InstructionMnemonic.LDA:

                break;
            default:
                this.fail();
                break;
        }
    }
}