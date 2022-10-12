import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { Simulation } from "./Simulation";

export class ZInstruction extends Instruction {
    private extra: string;

    public constructor(core: CoreInstruction, line: Line) {
        super(core, line);

        this.extra = line.getArgs();
    }

    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`${core.mnemonic}: ${this.extra};`);
    }

    public override execute(sim: Simulation): void {
        switch (this.mnemonic) {
            case InstructionMnemonic.PRNT:

                break;
            case InstructionMnemonic.PRNL:

                break;
            case InstructionMnemonic.HALT:

                break;
            case InstructionMnemonic.DUMP:

                break;
            default:
                this.fail();
                break;
        }
    }
}