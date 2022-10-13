import { CoreInstruction } from "./CoreInstruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { PackedNumber } from "./PackedNumber";
import { Simulation } from "./Simulation";
import { Parser } from './Parser';

export class Instruction {

    protected readonly _mnemonic: InstructionMnemonic;

    protected readonly _code: PackedNumber;

    public constructor(core: CoreInstruction, line: Line) {
        // get the mnemonic
        this._mnemonic = line.getLabel().toUpperCase() as InstructionMnemonic;

        // get the argument values
        let values = core.extractArgValuesFromLine(line);

        // pack into data
        this._code = new PackedNumber(0);

        if (values !== undefined) {
            this.setCodes(core, values);
        }
    }

    // private getArgValues(index: number, core: CoreInstruction, line: Line): number[] {
    //     //split up
    //     let splitFormatting = core.getArgsFormat().split('X');
    //     if (splitFormatting.length >= 3) {
    //         splitFormatting = splitFormatting.splice(1, splitFormatting.length - 2); // remove beginning and end
    //     }

    //     // even indices are the numbers
    //     // odd indices are the splits

    //     let rawArgs = line.getArgs();

    //     // check if the raw arguments follows the given formatting
    //     let typeIndex = 0;
    //     let splitIndex = 1;
    //     let j: number;
    //     let inside: string;
    //     let value: number | null;

    //     let args: number[] = new Array();

    //     for (let i = 0; i < rawArgs.length; i++, typeIndex += 2, splitIndex += 2) {
    //         // find next split location
    //         if (splitIndex >= splitFormatting.length) {
    //             // if out of things to split by, go to end
    //             j = rawArgs.length;
    //         } else {
    //             //console.log(`Splitting by: ${splitFormatting[splitIndex]} for ${core.argTypes[parseInt(splitFormatting[typeIndex])]}`);
    //             // split by next thing to split by
    //             j = rawArgs.indexOf(splitFormatting[splitIndex], i);
    //         }

    //         // get the inside
    //         inside = rawArgs.substring(i, j).trim();

    //         // parse based on type
    //         switch (core.getArgTypes()[parseInt(splitFormatting[typeIndex])]) {
    //             case 'r': // register
    //                 value = Parser.parseRegister(inside);
    //                 break;
    //             case 'i': // immediate (number)
    //                 value = Parser.parseImmediate(inside);
    //                 break;
    //             case 'l': // label
    //                 value = Parser.parseLabel(inside, index);
    //                 break;
    //             default:
    //                 value = -1;
    //                 break;
    //         }

    //         // did we get an invalid result?
    //         if (value !== null) {
    //             args.push(value);
    //         } else {
    //             args.push(0);
    //             console.log(`Invalid parse: "${inside}" of type ${core.getArgTypes()[parseInt(splitFormatting[typeIndex])]}`);
    //         }

    //         // catch i up to j
    //         if (splitIndex >= splitFormatting.length) {
    //             // end of loop
    //             break;
    //         } else {
    //             i = j + splitFormatting[splitIndex].length - 1;
    //         }
    //     }

    //     return args;
    // }

    protected setCodes(core: CoreInstruction, values: number[]): void {
        //console.log(`${core.getMnemonic()}: ${values.join(", ")};`);
        this._code.setNumber(0);
    }

    public execute(sim: Simulation): void {
        console.log(`Nothing executed for ${this.toString()}.`);
    }

    protected fail(): void {
        console.log(`Failed to execute ${this._mnemonic} in ${this.constructor.name}`);
    }

    public getCode(): number {
        return this._code.getNumber();
    }

    public getCodeString(): string {
        return this._code.toString(32);
    }

    protected getCodeValues(): number[] {
        return new Array();
    }

    public toString(): string {
        return `${this._mnemonic.toString().padEnd(6)} ${this.getCodeValues().join(' ')}`;
    }
}