import { CoreInstruction } from "./CoreInstruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { PackedNumber } from "./PackedNumber";
import { Simulation } from "./Simulation";
import { Parser } from './Parser';

export class Instruction {

    protected mnemonic: InstructionMnemonic;

    protected code: PackedNumber;

    public constructor(core: CoreInstruction, line: Line) {
        // get the mnemonic
        this.mnemonic = line.getLabel() as InstructionMnemonic;

        // get the argument values
        let values = this.getArgValues(core, line);

        // pack into data
        this.code = new PackedNumber(0);
        this.setCode(core, values);
    }

    private getArgValues(core: CoreInstruction, line: Line): number[] {
        //split up
        let splitFormatting = core.args.split(new RegExp('[{}]'));
        if (splitFormatting.length >= 3) {
            splitFormatting = splitFormatting.splice(1, splitFormatting.length - 2); // remove beginning and end
        }

        // even indices are the numbers
        // odd indices are the splits

        let rawArgs = line.getArgs();

        // check if the raw arguments follows the given formatting
        let typeIndex = 0;
        let splitIndex = 1;
        let j: number;
        let inside: string;
        let value: number;

        let args: number[] = new Array();

        for (let i = 0; i < rawArgs.length; i++, typeIndex += 2, splitIndex += 2) {
            // find next split location
            if (splitIndex >= splitFormatting.length) {
                // if out of things to split by, go to end
                j = rawArgs.length;
            } else {
                //console.log(`Splitting by: ${splitFormatting[splitIndex]} for ${core.argTypes[parseInt(splitFormatting[typeIndex])]}`);
                // split by next thing to split by
                j = rawArgs.indexOf(splitFormatting[splitIndex], i);
            }

            // get the inside
            inside = rawArgs.substring(i, j).trim();

            // parse based on type
            switch (core.argTypes[parseInt(splitFormatting[typeIndex])]) {
                case 'r': // register
                    value = Parser.parseRegister(inside);
                    break;
                case 'i': // immediate (number)
                    value = Parser.parseImmediate(inside);
                    break;
                case 'l': // label
                    value = Parser.parseLabel(inside);
                    break;
                default:
                    value = -1;
                    break;
            }

            // did we get an invalid result?
            if (value >= 0) {
                args.push(value);
            } else {
                args.push(0);
                console.log(`Invalid parse: "${inside}" of type ${core.argTypes[parseInt(splitFormatting[typeIndex])]}`);
            }

            // catch i up to j
            if (splitIndex >= splitFormatting.length) {
                // end of loop
                break;
            } else {
                i = j + splitFormatting[splitIndex].length - 1;
            }

        }

        return args;
    }

    protected setCode(core: CoreInstruction, values: number[]): void {
        console.log(`Attempting to set codes on an empty Instruction (${core.mnemonic}).`);
    }

    public execute(sim: Simulation): void {
        console.log("Attempting to execute an empty Instruction.");
    }

    protected fail(): void {
        console.log(`Failed to execute ${this.mnemonic} in ${this.constructor.name}`);
    }

    public toString(): string {
        return `${this.mnemonic}:\t${this.code}`;
    }
}