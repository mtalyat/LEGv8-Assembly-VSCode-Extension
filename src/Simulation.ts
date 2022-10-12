import { exec } from "child_process";
import { Instruction } from "./Instruction";
import { PackedNumber } from "./PackedNumber";
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

    private _executionIndex: number;

    private _memory: Uint8Array;
    private _registers: BigUint64Array;
    private _flags: PackedNumber;

    public constructor(instructions: Instruction[]) {
        this._stopwatch = new Stopwatch();

        this._isRunning = false;

        this._instructions = instructions;

        this._executionIndex = -1;

        this._memory = Buffer.alloc(Simulation.memorySize);
        this._registers = new BigUint64Array(Simulation.registerCount);
        this._flags = new PackedNumber(0);
    }

    //#region Data

    //#region Registers

    public getReg(index: number): bigint {
        const r = this._registers.at(index);

        if (r === undefined) {
            return BigInt(0);
        } else {
            return r;
        }
    }

    //#endregion

    //#region Memory



    //#endregion

    // clears the registers, memory, and flags of all of their data
    public clear(): void {
        // clear all stored data
        this._memory.fill(0);
        this._registers.fill(BigInt(0));
        this._flags.setNumber(0);

        // set defaults

    }

    //#endregion

    //#region  Running

    public start(): void {
        // do nothing if already running
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;

        this._stopwatch.restart();
    }

    public step(): void {
        // do nothing if not running
        if (!this._isRunning) {
            return;
        }

        // if can execute, then do so
        if (this._executionIndex < this._instructions.length) {
            // get the instruction
            let instruction = this._instructions[this._executionIndex];

            // execute it
            instruction.execute(this);
        } else {
            // finished
            this.stop();
        }
    }

    public stop(): void {
        // do nothing if not running
        if (!this._isRunning) {
            return;
        }

        this._stopwatch.stop();

        console.log(`Program executed in ${this._stopwatch.elapsed()}ms.`);

        this._isRunning = false;
    }

    //#endregion

    //#region  Debugging

    public dump(): void {
        // print all registers

        // print all memory

        this.stop();
    }

    //#endregion

    // public print(): void {
    //     console.log("Printing sim.\n" + this._instructions.map(function (val, index) {
    //         return val.toString();
    //     }).join('\n'));
    // }
}