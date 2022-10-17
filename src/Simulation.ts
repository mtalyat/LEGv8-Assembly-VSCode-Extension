import { exec } from "child_process";
import { off } from "process";
import { Instruction } from "./Instruction";
import { Output } from "./Output";
import { PackedNumber } from "./PackedNumber";
import { Parser } from "./Parser";
import { Stopwatch } from "./Stopwatch";

export class Simulation {
    /**
     * The number of registers within this Simulation.
     */
    public static readonly registerCount: number = 32;

    /**
     * The size of the memory within this Simulation, in bytes.
     */
    public static readonly memorySize: number = 4096;

    /**
     * The index of the Zero Register (XZR).
     */
    public static readonly xzrRegister: number = this.registerCount - 1;
    /**
     * The index of the Link Register (LR).
     */
    public static readonly lrRegister: number = this.registerCount - 2;
    /**
     * The index of the Frame Pointer register (FP).
     */
    public static readonly fpRegister: number = this.registerCount - 3;
    /**
     * The index of the Stack Pointer register (SP).
     */
    public static readonly spRegister: number = this.registerCount - 4;
    /**
     * The index of the 0th scratch register (IP0).
     */
    public static readonly ip0Register: number = 16;
    /**
     * The index of the 1st scratch register (IP1).
     */
    public static readonly ip1Register: number = 17;

    /**
     * The stopwatch that measures the time of the program when ran.
     */
    private _stopwatch: Stopwatch;

    /**
     * Is this Simulation running?
     */
    private _isRunning: boolean;

    /**
     * The array of Instructions within this Simulation.
     */
    private _instructions: Instruction[];

    /**
     * A list of Instruction indices that logs the stack trace of the program.
     */
    private _stackTrace: number[];

    /**
     * The current execution index of the Simulation.
     */
    private _executionIndex: number;

    /**
     * A UInt8 array that represents the memory.
     */
    private readonly _memory: Uint8Array;
    /**
     * A UInt64 array that represents the registers.
     */
    private readonly _registers: BigInt64Array;
    /**
     * A PackedNumber that stores the bits for the flags.
     */
    private readonly _flags: PackedNumber;

    /**
     * Creates a new Simulation that will run on the given Instruction array.
     * @param instructions the instructions that this Simulation will run.
     */
    public constructor(instructions: Instruction[]) {
        this._stopwatch = new Stopwatch();

        this._isRunning = false;

        this._instructions = instructions;

        this._stackTrace = new Array();

        this._executionIndex = -1;

        this._memory = Buffer.alloc(Simulation.memorySize);
        this._registers = new BigInt64Array(Simulation.registerCount);
        this._flags = new PackedNumber(0);

        this.reset();
    }

    //#region Data

    //#region Registers

    public getReg(index: number): bigint {
        const r = this._registers.at(index);

        if (r === undefined) {
            return -1n;
        } else {
            return r;
        }
    }

    public getRegAsNumber(index: number): number {
        const r = this._registers.at(index);

        if (r === undefined) {
            return -1;
        } else {
            // cap and return as a number
            return r > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : (r < Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : Number(r));
        }
    }

    public setRegAsNumber(index: number, value: number): void {
        this.setReg(index, BigInt(value));
    }

    public setReg(index: number, value: bigint): void {
        // only set if not the zero register, which should always be zero
        if (index !== Simulation.xzrRegister) {
            this._registers[index] = value;
        }
    }

    //#endregion

    //#region Memory

    public getMem(index: number, size: number): number {
        if (index === undefined) {
            return -1;
        } else {
            let packed = new PackedNumber(0);

            // pack memory bytes into the number
            for (let i = 0; i < size; i++) {
                packed.setByte(i, this._memory[index + i], 1);
            }

            return packed.getNumber();
        }
    }

    public setMem(index: number, value: number, size: number): void {
        // turn value into a packed number
        let packed = new PackedNumber(value);

        // unpack it into memory
        for (let i = 0; i < size; i++) {
            this._memory[index + i] = packed.getByte(i, 1);
        }
    }

    //#endregion

    //#region Flags

    /**
     * Sets the flags using the given result from the given left and right operands.
     * @param result The resulting value from the operation before setting the flags.
     * @param left The left operand from the operation before setting the flags.
     * @param right The right operand from the operation before setting the flags.
     */
    public setFlags(result: bigint, left: bigint, right: bigint): void {
        this._flags.setBit(0, result === 0n); // zero flag
        this._flags.setBit(1, result < 0); // negative flag

        // TODO: test carry and overflow conditions, they are likely not correct
        this._flags.setBit(2, (left > 0 && right > 0 && result < left && result < right) || (left < 0 && right < 0 && result > left && result > right)); // carry flag
        this._flags.setBit(3, (left > 0 && right > 0 && result < 0) || (left < 0 && right < 0 && result > 0)); // overflow flag
    }

    /**
     * Checks if the zero flag is enabled.
     * @returns true if the zero flag is enabled.
     */
    public zeroFlag(): boolean {
        return this._flags.getBit(0);
    }

    /**
     * Checks if the negative flag is enabled.
     * @returns true if the negative flag is enabled.
     */
    public negativeFlag(): boolean {
        return this._flags.getBit(1);
    }

    /**
     * Checks if the carry flag is enabled.
     * @returns true if the carry flag is enabled.
     */
    public carryFlag(): boolean {
        return this._flags.getBit(2);
    }

    /**
     * Checks if the overflow flag is enabled.
     * @returns true if the overflow flag is enabled.
     */
    public overflowFlag(): boolean {
        return this._flags.getBit(3);
    }

    //#endregion

    /**
     * Clears the registers, memory, and flags of all of their data.
     */
    public clear(): void {
        // clear all stored data
        this._memory.fill(0);
        this._registers.fill(0n);
        this._flags.setNumber(0);

        // set defaults
        this.setReg(Simulation.spRegister, BigInt(Simulation.memorySize));
        this.setReg(Simulation.fpRegister, BigInt(Simulation.memorySize));
    }

    //#endregion

    //#region Running

    public reset(): void {
        // clear all data
        this.clear();

        // reset all other things
        this._executionIndex = 0;
        this._stackTrace = new Array();

        this._stopwatch.reset();
    }

    public start(): void {
        // do nothing if already running
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;

        this.reset();

        this._stopwatch.start();
    }

    public step(): boolean {
        // do nothing if not running
        if (!this._isRunning) {
            return false;
        }

        // if can execute, then do so
        if (this._executionIndex >= 0 && this._executionIndex < this._instructions.length) {
            // get the instruction
            let instruction = this._instructions[this._executionIndex];

            // debug
            // console.log(instruction.toString());

            // increment instruction index
            this._executionIndex++;

            // add to stack trace
            this._stackTrace.push(this._executionIndex);

            // execute it
            instruction.execute(this);

            return true;
        } else {
            // finished
            this.stop();

            return false;
        }
    }

    /**
     * Stops the Simulation.
     * @returns 
     */
    public stop(): void {
        // do nothing if not running
        if (!this._isRunning) {
            return;
        }

        this._stopwatch.stop();

        this._isRunning = false;
    }

    /**
     * Runs the program asynchronously.
     * @returns 
     */
    public async run(): Promise<Simulation> {
        await new Promise(async (resolve, reject) => {
            // start the simulation
            this.start();

            // setTimeout(() => {
            //     reject("Program timed out.");
            // }, 10);

            // step through it
            while (this.step()) { }

            // return this
            resolve(this);
        });

        return this;
    }

    public branch(index: number): void {
        this._executionIndex = index;
    }

    public index(): number {
        return this._executionIndex;
    }

    // gets the time spent on executing the program in milliseconds
    public executionTime(): number {
        return this._stopwatch.elapsed();
    }

    //#endregion

    //#region  Debugging

    public dump(): void {
        // print all registers
        // print all memory
        this.printData();

        // quit program
        this.stop();
    }

    public halt(): void {
        // print all registers
        // print all memory
        this.printData();

        // TODO: do not stop, just pause
        this.stop();
    }

    private printData(): void {
        // print registers
        let value;
        for (let i = 0; i < this._registers.length; i++) {
            value = this._registers[i];
            this.output(`X${i}:\t[${value.toString(2)}]\t(${value})`);
        }

        // print memory
        let texts: string[] = new Array();
        for (let i = 0; i < this._memory.length; i++) {
            value = this._memory[i];
            texts.push(value.toString());
        }
        this.output(texts.join(' '));
    }

    // prints the given text to the screen, after being formatted
    public print(text: string): void {
        this.output(this.format(text));
    }

    // prints the text to the screen
    public output(text: string): void {
        console.log(text);
        Output.writeLine(text);
    }

    private format(text: string): string {
        let value: number | undefined;

        // check for just a register
        if (!text.includes(' ')) {
            // only one argument, if a register, print that
            value = Parser.parseRegister(text);

            if (value !== undefined) {
                // it was a valid register, print that value
                return this.getReg(value).toString();
            }
        }

        // more than just a register, do normal formatting

        let output: string[] = new Array();

        let cbIndex: number; // curly bracket index
        let sbIndex: number; // square bracket index
        let index: number; // first bracket index
        let closing: string;

        let inside: string;

        // search for { } and replace given register value inside
        // search for [ ] and replace memory at the given register value inside
        for (let i = 0; i < text.length; i++) {
            // find whichever one comes first, if not found, pretend like at the end of the string
            cbIndex = text.indexOf('{', i);
            cbIndex = cbIndex === -1 ? text.length : cbIndex;
            sbIndex = text.indexOf('[', i);
            sbIndex = sbIndex === -1 ? text.length : sbIndex;

            // use the first one
            if (cbIndex <= sbIndex) {
                index = cbIndex;
                closing = '}';
            } else {
                index = sbIndex;
                closing = ']';
            }

            // add text before first one
            if (i !== index) {
                output.push(text.substring(i, index));
            }

            // advance i to index
            i = index + 1;

            // if still in the loop
            if (i >= text.length) {
                break;
            }

            // find ending
            index = text.indexOf(closing, i);
            index = index === -1 ? text.length : index;

            // parse that
            inside = text.substring(i, index);
            value = Parser.parseRegister(inside);

            // if a valid value, place it
            if (value !== undefined) {
                if (closing === '}') {
                    // raw register value
                    output.push(this.getReg(value).toString());
                } else {
                    // mem value at the given register value pointer position
                    output.push(this.getMem(Number(this.getReg(value)), 1).toString());
                }
            } else {
                // not valid? just put the inside value
                output.push(inside);
            }

            // advance i again
            i = index;
        }

        return output.join("");
    }

    //#endregion
}