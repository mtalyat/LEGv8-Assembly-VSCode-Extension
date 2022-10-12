import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Simulation } from "./Simulation";

export class IInstruction extends Instruction {
    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${values.join(", ")};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.ADDI:

                break;
            case InstructionMnemonic.ADDIS:

                break;
            case InstructionMnemonic.SUBI:

                break;
            case InstructionMnemonic.SUBIS:

                break;
            case InstructionMnemonic.ANDI:

                break;
            case InstructionMnemonic.ANDIS:

                break;
            case InstructionMnemonic.EORI:

                break;
            case InstructionMnemonic.ORRI:

                break;

            case InstructionMnemonic.CMPI:

                break;
            default:
                this.fail();
                break;
        }
    }
}