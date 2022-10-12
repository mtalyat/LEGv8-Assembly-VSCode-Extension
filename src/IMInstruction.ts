import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class IMInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.MOVK:
                //e.SetReg(Rd, (r & ((long)~0 << 16)) | (long)MovImmediate);
                break;
            case InstructionMnemonic.MOVZ:

                break;

            default:
                this.fail();
                break;
        }
    }
}