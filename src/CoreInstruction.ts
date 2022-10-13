import { format } from "path";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { Output } from "./Output";
import { Parser } from "./Parser";

export class CoreInstruction {
    private _name: string;

    private _mnemonic: InstructionMnemonic;

    private _format: string;

    private _opCodeMin: number;
    private _opCodeMax: number;

    private _argsFormat: string;

    private _args: string;

    private _argTypes: string;

    public constructor(name: string, mnemonic: string, format: string, opCode: string, argsFormat: string, args: string, argTypes: string) {
        this._name = name;
        this._mnemonic = mnemonic as InstructionMnemonic;
        this._format = format;
        let opSplit = opCode.split('-');
        this._opCodeMin = parseInt(opSplit[0], 16);
        if (opCode.length === 2) {
            this._opCodeMax = parseInt(opSplit[1], 16);
        } else {
            this._opCodeMax = this._opCodeMin;
        }
        if (argsFormat.startsWith('"')) {
            this._argsFormat = argsFormat.slice(1, argsFormat.length - 1);
        } else {
            this._argsFormat = argsFormat;
        }
        this._args = args;
        this._argTypes = argTypes;
    }

    //#region Getters

    public getName(): string {
        return this._name;
    }

    public getMnemonic(): InstructionMnemonic {
        return this._mnemonic;
    }

    public getFormat(): string {
        return this._format;
    }

    public getOpCodeRange(): string {
        if (this._opCodeMin === this._opCodeMax) {
            return this._opCodeMin.toString();
        } else {
            return `${this._opCodeMin}-${this._opCodeMax}`;
        }
    }

    public getOpCodeMin(): number {
        return this._opCodeMin;
    }

    public getOpCodeMax(): number {
        return this._opCodeMax;
    }

    public getArgsFormat(): string {
        return this._argsFormat;
    }

    public getArgs(): string {
        return this._args;
    }

    public getArgTypes(): string {
        return this._argTypes;
    }

    //#endregion

    // gets the argument values from a line
    // returns undefined if incorrect syntax
    public extractArgValuesFromLine(line: Line): number[] | undefined {
        // get the splits of what we should find within the line
        let splits = this._argsFormat.split('_');
        if (splits.length >= 1) {
            // if beginning is empty
            if (splits[0] === "") {
                // if empty at the end as well
                if (splits.length >= 2 && splits[splits.length - 1] === "") {
                    splits = splits.splice(1, splits.length - 2);
                } else {
                    splits = splits.splice(1, splits.length - 1);
                }
            } else if (splits[splits.length - 1]) {
                // if end is empty
                splits = splits.splice(0, splits.length - 1);
            }
        }

        let lineArgs: string = line.getArgs();

        // the index of the split in the lineArgs
        let lineIndex: number;
        // the index of the split in the splits array
        let splitIndex: number = 0;
        // the index of the argument in _args/_argTypes
        let argIndex: number = 0;

        // the split string
        let split: string;
        // the arg substring
        let argStr: string;
        // the arg value
        let arg: number | undefined;

        // the output of arg values
        let args: number[] = new Array(this._args.length);
        args.fill(0); // set to all zeros, in case some do not get set

        // split the line manually, in order, to ensure the syntax is correct
        for (let i = 0; i < lineArgs.length; i++) {
            // find the index of the first part
            if (splitIndex >= splits.length) {
                // no more splits, but there is still string to parse
                // go to the end of the line
                split = "";
                lineIndex = lineArgs.length;
            } else {
                // there is still something to split by, so use that
                split = splits[splitIndex];
                lineIndex = lineArgs.indexOf(split, i);
            }

            // if found...
            if (lineIndex >= 0) {
                // if should get an arg, get it
                if (argIndex < args.length) {
                    // get the argument substring
                    argStr = lineArgs.substring(i, lineIndex);

                    // parse based on type
                    switch (this._argTypes[argIndex]) {
                        case 'r': // register
                            arg = Parser.parseRegister(argStr);
                            break;
                        case 'i': // immediate
                            arg = Parser.parseImmediate(argStr);
                            break;
                        case 'l': // label
                            arg = Parser.parseLabel(argStr);
                            break;
                    }

                    // if undefined, the argument is invalid
                    if (arg === undefined) {
                        Output.error(`Invalid argument "${argStr}" from ${i} to ${i + lineIndex} on line: ${line.toString()}`);
                        return undefined;
                    }

                    // argument is defined, thus it is valid
                    // place at the index given in _args
                    args[parseInt(this._args[argIndex])] = arg;

                    // advance arg index
                    argIndex++;
                }

                // advance i to past the found split
                i = lineIndex + split.length - 1;

                // advance split index
                splitIndex++;
            } else {
                // if not found, the syntax is not correct
                Output.error(`Invalid syntax, could not find "${split}" at ${i}, should follow "${this._argsFormat}" on line: ${line.toString()}`);
                return undefined;
            }
        }

        return args;
    }

    public toString(): string {
        return `${this._mnemonic} ${this._args}`;
    }
}