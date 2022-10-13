import { CoreInstruction } from "./CoreInstruction";
import { Instruction } from "./Instruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { Simulation } from "./Simulation";

export class ZInstruction extends Instruction {
    private extra: string;

    public constructor(core: CoreInstruction, line: Line) {
        // ignore args so super class does not parse it
        super(core, new Line(line.getLabel(), line.getLineNumber()));

        this.extra = line.getArgs();
    }

    protected setCodes(core: CoreInstruction, values: number[]): void {
        super.setCodes(core, values);
        // nothing to set for z, as it is a debugging format and would not exist in real assembly
    }

    public override execute(sim: Simulation): void {
        switch (this._mnemonic) {
            case InstructionMnemonic.PRNT:
                sim.print(this.extra);
                break;
            case InstructionMnemonic.PRNL:
                sim.output("");
                break;
            case InstructionMnemonic.HALT:
                sim.halt();
                break;
            case InstructionMnemonic.DUMP:
                sim.dump();
                break;
            default:
                this.fail();
                break;
        }
    }
}