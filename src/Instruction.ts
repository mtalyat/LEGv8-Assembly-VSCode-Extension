import { CoreInstruction } from "./CoreInstruction";
import { InstructionMnemonic } from "./InstructionMnemonic";
import { Line } from "./Line";
import { Output } from "./Output";
import { PackedNumber } from "./PackedNumber";
import { Simulation } from "./Simulation";

/**
 * Holds the data for one line of assembly, which can be executed and have unique functionality.
 */
export class Instruction {
    /**
     * The size of an Instruction in bits.
     */
    public static readonly SIZE_IN_BITS: number = 32;

    /**
     * The InstructionMnemonic (name) associated with this Instruction.
     */
    protected readonly _mnemonic: InstructionMnemonic;
    public get Mnemonic(): InstructionMnemonic {
        return this._mnemonic;
    }

    /**
     * The machine code that this instruction contains.
     */
    protected readonly _code: PackedNumber;

    private readonly _lineNumber: number;
    public get LineNumber(): number {
        return this._lineNumber;
    }

    /**
     * Creates a new Instruction using the given Core Instruction template data, as well as the given Line from the assembly file.
     * @param core the Core Instruction associated with this Instruction.
     * @param line The line that this Instruction is coming from.
     */
    public constructor(core: CoreInstruction, line: Line) {
        // get the mnemonic
        this._mnemonic = line.getLabel().toUpperCase() as InstructionMnemonic;

        // get the argument values
        // pack into data
        this._code = new PackedNumber(0);

        this._lineNumber = line.getLineNumber();

        // get the argument values
        if (line.getArgs().length !== 0) {
            let values = core.extractArgValuesFromLine(line);

            if (values !== undefined) {
                this.setCodes(core, values);
            }
        }
    }

    /**
     * Sets the machine code bits in correspondence to the given values.
     * @param core the Core Instruction associated with this Instruction.
     * @param values the Line that this Instruction is coming from.
     */
    protected setCodes(core: CoreInstruction, values: number[]): void {
        this._code.setNumber(0);
    }

    /**
     * Runs this Instruction's functionality.
     * @param sim the Simulation environment that this Instruction is within.
     */
    public execute(sim: Simulation): void {
        Output.error(`Nothing executed for ${this.toString()}.`);
    }

    /**
     * Called when this Instruction failed to execute.
     */
    protected fail(): void {
        Output.error(`Failed to execute ${this._mnemonic} in ${this.constructor.name}`);
    }

    /**
     * Gets the machine code form of this Instruction.
     * @returns the machine code of this Instruction.
     */
    public getCode(): number {
        return this._code.getNumber();
    }

    /**
     * Gets the machine code form of this Instruction, as a string.
     * @returns the machine code of this Instruction, as a string.
     */
    public getCodeString(): string {
        return this._code.toString(32);
    }

    /**
     * Gets the values stored within this Instruction.
     * @returns the values stored within this Instruction.
     */
    protected getCodeValues(): number[] {
        return new Array();
    }

    /**
     * Converts this Instruction into a readable string.
     * @returns a string representing this Instruction.
     */
    public toString(): string {
        return `${this._mnemonic.toString().padEnd(6)} ${this.getCodeValues().join(' ')}`;
    }
}