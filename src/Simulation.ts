import { exec } from "child_process";
import { off } from "process";
import { Instruction } from "./Instruction";
import { Output } from "./Output";
import { PackedNumber } from "./PackedNumber";
import { Parser } from "./Parser";
import { Stopwatch } from "./Stopwatch";

export class Simulation {
    public static readonly registerCount: number = 32;

    public static readonly memorySize: number = 4096;

    public static readonly xzrRegister: number = this.registerCount - 1;
    public static readonly lrRegister: number = this.registerCount - 2;
    public static readonly fpRegister: number = this.registerCount - 3;
    public static readonly spRegister: number = this.registerCount - 4;
    public static readonly ip0Register: number = 16;
    public static readonly ip1Register: number = 17;

    private _stopwatch: Stopwatch;

    private _isRunning: boolean;

    private _instructions: Instruction[];

    private _stackTrace: number[];

    private _executionIndex: number;

    private readonly _memory: Uint8Array;
    private readonly _registers: Uint32Array;
    private readonly _flags: PackedNumber;

    public constructor(instructions: Instruction[]) {
        this._stopwatch = new Stopwatch();

        this._isRunning = false;

        this._instructions = instructions;

        this._stackTrace = new Array();

        this._executionIndex = -1;

        this._memory = Buffer.alloc(Simulation.memorySize);
        this._registers = new Uint32Array(Simulation.registerCount);
        this._flags = new PackedNumber(0);

        this.reset();
    }

    //#region Data

    //#region Registers

    public getReg(index: number): number {
        const r = this._registers.at(index);

        if (r === undefined) {
            return -1;
        } else {
            return r;
        }
    }

    public setReg(index: number, value: number): void {
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

    public setFlags(result: number, left: number, right: number): void {
        this._flags.setBit(0, result === 0); // zero flag
        this._flags.setBit(1, result < 0); // negative flag
        this._flags.setBit(2, (left > 0 && right > 0 && result < left && result < right) || (left < 0 && right < 0 && result > left && result > right)); // carry flag
        this._flags.setBit(3, (left > 0 && right > 0 && result < 0) || (left < 0 && right < 0 && result > 0)); // overflow flag
    }

    public zeroFlag(): boolean {
        return this._flags.getBit(0);
    }

    public negativeFlag(): boolean {
        return this._flags.getBit(1);
    }

    public carryFlag(): boolean {
        return this._flags.getBit(2);
    }

    public overflowFlag(): boolean {
        return this._flags.getBit(3);
    }

    //#endregion

    // clears the registers, memory, and flags of all of their data
    public clear(): void {
        // clear all stored data
        this._memory.fill(0);
        this._registers.fill(0);
        this._flags.setNumber(0);

        // set defaults
        this.setReg(Simulation.spRegister, Simulation.memorySize);
        this.setReg(Simulation.fpRegister, Simulation.memorySize);
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

    public stop(): void {
        // do nothing if not running
        if (!this._isRunning) {
            return;
        }

        this._stopwatch.stop();

        this._isRunning = false;
    }

    // runs the program synthronously
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
        let output: string[] = new Array();

        let cbIndex: number; // curly bracket index
        let sbIndex: number; // square bracket index
        let index: number; // first bracket index
        let closing: string;

        let inside: string;
        let value: number | undefined;

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
                    output.push(this.getMem(this.getReg(value), 1).toString());
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