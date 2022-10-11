import * as path from 'path';
import * as fs from 'fs';
import { Line } from "./Line";
import { Instruction } from "./Instruction";
import { Simulation } from "./Simulation";
import { CoreInstruction } from "./CoreInstruction";

export class Parser {
    static readonly identifierComments: string = "//";

    static readonly identifierLabelPostfix: string = ":";

    static readonly identifierRegisterPrefix: string = "X";

    static readonly identifierImmediatePrefix: string = "#";

    private static _cores: Map<string, CoreInstruction> = new Map();

    private static _labels: Map<string, number> = new Map();

    public static loadCoreInstructions(localPath: string): void {
        const filePath = path.join(__dirname, localPath);

        const file = fs.readFileSync(filePath, "utf8").toString();

        const lines = file.split('\n').splice(1);

        // clear old data, if any
        this._cores.clear();

        let core: CoreInstruction | null;
        let args;

        for (let i = 0; i < lines.length; i++) {
            // ignore empty lines
            if (!lines[i] || lines[i].length === 0) {
                continue;
            }

            // parse
            core = this.parseCoreInstruction(lines[i]);

            // if a valid core instruction, add it to the array
            if (core) {
                this._cores.set(core.mnemonic, core);
            }
        }
    }

    public static parseCoreInstruction(text: string): CoreInstruction | null {
        // split by commas not within strings
        let args = text.split(new RegExp(',(?=(?:[^"]*"[^"]*")*[^"]*$)'));

        // if the right amount of arguments...
        if (args.length === 6) {
            return new CoreInstruction(args[0], args[1], args[2], args[3], args[4], args[5]);
        } else {
            console.log(`ERR: Invalid arguments from line '${args.join("...")}' (${args.length})`);
            return null;
        }
    }

    // parses a line
    public static parseLine(text: string, lineNumber: number): Line {
        //ignore comments
        return new Line(text.split(Parser.identifierComments, 1)[0].trimEnd(), lineNumber);
    }

    // parses an instruction from a line
    public static parseInstruction(line: Line): Instruction | null {
        // assume in instruction format

        // find matching core instruction
        let core = this._cores.get(line.getLabel());

        if (core !== undefined) {
            // found the core

            // check formatting
            if (line.hasFormatting(core.args, core.argTypes)) {

                return new Instruction(line);
            }

            // invalid syntax
            console.log(`Invalid syntax: ${line.toString()}`);
        } else {
            console.log(`Unrecognized: ${line.toString()}`);
        }

        return null;
    }

    // parses an entire simulation from the given text
    public static parseSimulation(text: string): Simulation {
        // split by lines
        let textLines = text.split("\n");

        // turn each line into a Line
        let line: Line;
        let textLine: string;

        let instructionLines: Line[] = new Array();

        for (let i = 0; i < textLines.length; i++) {
            textLine = textLines[i];

            if (!textLine) {
                continue;
            }

            line = this.parseLine(textLine, i + 1);

            if (!line.isEmpty()) {
                // check for label
                if (line.getLabel().endsWith(this.identifierLabelPostfix)) {
                    // must be a label
                    this._labels.set(line.getLabel().substring(0, line.getLabel().length - 1), instructionLines.length);
                } else {
                    // must be an instruction
                    instructionLines.push(line);
                }
            }
        }

        // compile instructions
        let instructions: Instruction[] = new Array();
        let instruction: Instruction | null;

        for (let i = 0; i < instructionLines.length; i++) {
            line = instructionLines[i];

            if (line === undefined) {
                continue;
            }

            // must be an instruction of some sort
            instruction = this.parseInstruction(line);

            if (instruction !== null) {
                instructions.push(instruction);
            }
        }

        return new Simulation(instructions);
    }

    public static parseRegister(text: string): number {
        let upperText = text.toUpperCase();

        // check for special cases
        switch (upperText) {
            case "XZR":
                return Simulation.xzrRegister;
            case "LR":
                return Simulation.lrRegister;
            case "FP":
                return Simulation.fpRegister;
            case "SP":
                return Simulation.spRegister;
            case "IP0":
                return Simulation.ip0Register;
            case "IP1":
                return Simulation.ip1Register;
            default:
                // must be a numbered register
                // must start with X
                if (upperText.startsWith(this.identifierRegisterPrefix)) {
                    // must be a number after the X
                    let num = this.parseNumber(upperText.substring(1));

                    // if a valid number and within the range
                    if (num >= 0 && num < Simulation.registerCount) {
                        return num;
                    }
                }

                // invalid argument
                return -1;
        }
    }

    public static parseImmediate(text: string): number {
        // make sure it starts with the identifier
        if (!text.startsWith(this.identifierImmediatePrefix)) {
            return -1;
        }

        // remove the identifier
        let str = text.substring(1);

        return this.parseNumber(str);
    }

    private static parseNumber(text: string): number {
        let num = parseInt(text);

        if (isNaN(num)) {
            return -1;
        } else {
            return num;
        }
    }

    public static parseLabel(text: string): number {
        let label = text;

        // remove ending :, if there is one
        if (label.endsWith(this.identifierLabelPostfix)) {
            label = label.substring(0, label.length - 2);
        }

        // now find label in map
        let value = this._labels.get(label);

        if (value === undefined) {
            // label does not exist
            return -1;
        } else {
            // label exists
            return value;
        }
    }
}