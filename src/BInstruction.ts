import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class BInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.B:

                break;
            case InstructionMnemonic.BL:

                break;
            default:
                this.fail();
                break;
        }
    }
}