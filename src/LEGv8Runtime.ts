import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';
import { TextEncoder, TextDecoder } from 'util';
import { Line } from './Line';
import { Parser } from './Parser';
import { Instruction } from './Instruction';
import { resolve } from 'path';
import { Simulation } from './Simulation';
import { Output } from './Output';
import { InstructionMnemonic } from './InstructionMnemonic';

const Net = require("net");
const Path = require('path');
const fs = require('fs');

export interface FileAccessor {
    isWindows: boolean;
    readFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, contents: Uint8Array): Promise<void>;
}

export interface IRuntimeBreakpoint {
    id: number;
    line: number;
    verified: boolean;
}

interface IRuntimeStepInTargets {
    id: number;
    label: string;
}

interface IRuntimeStackFrame {
    index: number;
    name: string;
    file: string;
    line: number;
    column?: number;
    instruction?: number;
}

interface IRuntimeStack {
    count: number;
    frames: IRuntimeStackFrame[];
}

interface RuntimeDisassembledInstruction {
    address: number;
    instruction: string;
    line?: number;
}

export type IRuntimeVariableType = bigint;

export class RuntimeVariable {
    // idk
    public reference?: number;

    public get value() {
        if (this._isRegister) {
            return this._simulation.getReg(this._index);
        } else {
            return this._simulation.getMem(this._index, 1);
        }
    }

    public set value(value: IRuntimeVariableType) {
        if (this._isRegister) {
            this._simulation.setReg(this._index, value);
        } else {
            this._simulation.setMem(this._index, value, 1);
        }
    }

    public get memory() {
        // if (this._memory === undefined && typeof this._value === 'string') {
        //     this._memory = new TextEncoder().encode(this._value);
        // }
        // return this._memory;
        return new Uint8Array();
    }

    constructor(public readonly name: string, private _isRegister: boolean, private _index: number, private _simulation: Simulation) { }

    public setMemory(data: Uint8Array, offset = 0) {
        // const memory = this.memory;
        // if (!memory) {
        //     return;
        // }

        // memory.set(data, offset);
        // this._memory = memory;
        // this._value = new TextDecoder().decode(memory);
    }
}

export function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A Mock runtime with minimal debugger functionality.
 * MockRuntime is a hypothetical (aka "Mock") "execution engine with debugging support":
 * it takes a Markdown (*.md) file and "executes" it by "running" through the text lines
 * and searching for "command" patterns that trigger some debugger related functionality (e.g. exceptions).
 * When it finds a command it typically emits an event.
 * The runtime can not only run through the whole file but also executes one line at a time
 * and stops on lines for which a breakpoint has been registered. This functionality is the
 * core of the "debugging support".
 * Since the MockRuntime is completely independent from VS Code or the Debug Adapter Protocol,
 * it can be viewed as a simplified representation of a real "execution engine" (e.g. node.js)
 * or debugger (e.g. gdb).
 * When implementing your own debugger extension for VS Code, you probably don't need this
 * class because you can rely on some existing debugger or runtime.
 */
export class LEGv8Runtime extends EventEmitter {

    private _simulation: Simulation = new Simulation();
    public get Simulation() {
        return this._simulation;
    }

    // the initial (and one and only) file we are 'debugging'
    private _sourceFile: string = '';
    public get sourceFile() {
        return this._sourceFile;
    }

    private variables = new Map<string, RuntimeVariable>();

    // the contents (= lines) of the one and only file
    private sourceLines: string[] = [];
    private starts: number[] = [];
    private ends: number[] = [];

    // This is the next line that will be 'executed'
    private _currentLine = 0;
    private get currentLine() {
        return this._currentLine;
    }
    private set currentLine(x) {
        this._currentLine = x;
        this.instruction = this.starts[x];
    }

    // This is the next instruction that will be 'executed'
    public instruction = 0;

    // maps from sourceFile to array of IRuntimeBreakpoint
    private breakPoints = new Map<string, IRuntimeBreakpoint[]>();

    // all instruction breakpoint addresses
    private instructionBreakpoints = new Set<number>();

    // since we want to send breakpoint events, we will assign an id to every event
    // so that the frontend can match events with breakpoints.
    private breakpointId = 1;

    private breakAddresses = new Map<string, string>();

    private namedException: string | undefined;
    private otherExceptions = false;

    private _returnStack: number[] = new Array();

    constructor(private fileAccessor: FileAccessor) {
        super();
    }

    /**
     * Start executing the given program.
     */
    public async start(program: string, stopOnEntry: boolean, debug: boolean): Promise<void> {

        await this.loadSource(this.normalizePathAndCasing(program));

        // start the simulation
        this._simulation.start();

        // show the output window
        Output.show();

        if (debug) {
            await this.verifyBreakpoints(this._sourceFile);

            if (stopOnEntry) {
                this.findNextStatement(false, 'stopOnEntry');
            } else {
                // we just start to run until we hit a breakpoint, an exception, or the end of the program
                this.continue(false);
            }
        } else {
            this.continue(false);
        }

        // stop the simulation
        this._simulation.stop();
    }

    /**
     * Continue execution to the end/beginning.
     */
    public continue(reverse: boolean) {
        while (!this.executeLine(this.currentLine, reverse)) {
            if (this.updateCurrentLine(reverse)) {
                break;
            }
            if (this.findNextStatement(reverse)) {
                break;
            }
        }
    }

    private continueUntilNextReturn(reverse: boolean) {
        if (this._returnStack.length === 0) {
            this.continue(reverse);
            return;
        }

        while (!this.executeLine(this.currentLine, reverse)) {
            if (this._returnStack[this._returnStack.length - 1] === this._simulation.executionIndex) {
                // found the index to stop at
                this._returnStack.pop();
                return;
            }

            if (this.updateCurrentLine(reverse)) {
                break;
            }
            if (this.findNextStatement(reverse)) {
                break;
            }
        }
    }

    private normalStep(reverse: boolean) {
        // if at the next position, remove it
        if (this._returnStack.length > 0 && this._returnStack[this._returnStack.length - 1] == this._simulation.executionIndex) {
            this._returnStack.pop();
        }

        // add return if BL
        if (this._simulation.getInstructionMnemonic(this._simulation.getIndexFromLineNumber(this.currentLine)) === InstructionMnemonic.BL) {
            // add a return index
            this._returnStack.push(this._simulation.executionIndex + 1);
        }

        if (!this.executeLine(this.currentLine, reverse)) {
            if (!this.updateCurrentLine(reverse)) {
                this.findNextStatement(reverse, 'stopOnStep');
            }
        }
    }

    /**
     * Step to the next/previous non empty line.
     */
    public step(instruction: boolean, reverse: boolean) {
        console.log("step");
        if (instruction) {
            if (reverse) {
                this.instruction--;
            } else {
                this.instruction++;
            }
            this.sendEvent('stopOnStep');
        } else {
            // step over
            // if a BL, continue until we come back to the next line after this BL
            if (this._simulation.getInstructionMnemonic(this._simulation.getIndexFromLineNumber(this.currentLine)) === InstructionMnemonic.BL) {
                // continue until we come back to the next line after this BL

                // add a return index
                this._returnStack.push(this._simulation.executionIndex + 1);

                // continue until we hit it
                this.continueUntilNextReturn(reverse);

                this.sendEvent('stopOnStep');
            } else {
                // otherwise act as normal
                this.normalStep(reverse);
            }
        }
    }

    private updateCurrentLine(reverse: boolean): boolean {
        // if (reverse) {
        //     if (this.currentLine > 0) {
        //         this.currentLine--;
        //     } else {
        //         // no more lines: stop at first line
        //         this.currentLine = 0;
        //         this.currentColumn = undefined;
        //         this.sendEvent('stopOnEntry');
        //         return true;
        //     }
        // } else {
        //     if (this.currentLine < this.sourceLines.length - 1) {
        //         this.currentLine++;
        //     } else {
        //         // no more lines: run to end
        //         this.currentColumn = undefined;
        //         this.sendEvent('end');
        //         return true;
        //     }
        // }
        // return false;
        this.currentLine = this._simulation.executionLineNumber();

        if (this.currentLine < 0 || this.currentLine >= this.sourceLines.length) {
            // no more lines: run to end
            this.sendEvent('end');
            return true;
        }

        // keep going, valid line
        return false;
    }

    /**
     * "Step into" for Mock debug means: go to next character
     */
    public stepIn(targetId: number | undefined) {
        this.normalStep(false);
        console.log("step in");
        // this.sendEvent('stopOnStep');
    }

    /**
     * "Step out" for Mock debug means: go to previous character
     */
    public stepOut() {
        this.continueUntilNextReturn(false);
        console.log("step out");
        this.sendEvent('stopOnStep');
    }

    public getStepInTargets(frameId: number): IRuntimeStepInTargets[] {

        // const line = this.getLine();
        // const words = this.getWords(this.currentLine, line);

        // // return nothing if frameId is out of range
        // if (frameId < 0 || frameId >= words.length) {
        //     return [];
        // }

        // const { name, index } = words[frameId];

        // // make every character of the frame a potential "step in" target
        // return name.split('').map((c, ix) => {
        //     return {
        //         id: index + ix,
        //         label: `target: ${c}`
        //     };
        // });
        return [];
    }

    /**
     * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
     */
    public stack(startFrame: number, endFrame: number): IRuntimeStack {

        const line = this.getLine();
        // const words = this.getWords(this.currentLine, line);
        // words.push({ name: 'BOTTOM', line: -1, index: -1 });	// add a sentinel so that the stack is never empty...

        // if the line contains the word 'disassembly' we support to "disassemble" the line by adding an 'instruction' property to the stackframe
        const instruction = line.indexOf('disassembly') >= 0 ? this.instruction : undefined;

        //const column = typeof this.currentColumn === 'number' ? this.currentColumn : undefined;

        const frames: IRuntimeStackFrame[] = [];
        // every word of the current line becomes a stack frame.
        for (let i = startFrame; i < Math.min(endFrame, this._simulation.instructionCount); i++) {

            const stackFrame: IRuntimeStackFrame = {
                index: i,
                name: `${i}: ${this._simulation.getInstruction(i)}`,
                file: this._sourceFile,
                line: this.currentLine,
                column: undefined,
                instruction: instruction
            };

            frames.push(stackFrame);
        }

        return {
            frames: frames,
            count: this._simulation.instructionCount
        };
    }

    /*
     * Determine possible column breakpoint positions for the given line.
     * Here we return the start location of words with more than 8 characters.
     */
    public getBreakpoints(path: string, line: number): number[] {
        // return this.getWords(line, this.getLine(line)).filter(w => w.name.length > 8).map(w => w.index);
        return [];
    }

    /*
     * Set breakpoint in file with given line.
     */
    public async setBreakPoint(path: string, line: number): Promise<IRuntimeBreakpoint> {
        path = this.normalizePathAndCasing(path);

        const bp: IRuntimeBreakpoint = { verified: false, line, id: this.breakpointId++ };
        let bps = this.breakPoints.get(path);
        if (!bps) {
            bps = new Array<IRuntimeBreakpoint>();
            this.breakPoints.set(path, bps);
        }
        bps.push(bp);

        await this.verifyBreakpoints(path);

        return bp;
    }

    /*
     * Clear breakpoint in file with given line.
     */
    public clearBreakPoint(path: string, line: number): IRuntimeBreakpoint | undefined {
        const bps = this.breakPoints.get(this.normalizePathAndCasing(path));
        if (bps) {
            const index = bps.findIndex(bp => bp.line === line);
            if (index >= 0) {
                const bp = bps[index];
                bps.splice(index, 1);
                return bp;
            }
        }
        return undefined;
    }

    public clearBreakpoints(path: string): void {
        this.breakPoints.delete(this.normalizePathAndCasing(path));
    }

    public setDataBreakpoint(address: string, accessType: 'read' | 'write' | 'readWrite'): boolean {

        const x = accessType === 'readWrite' ? 'read write' : accessType;

        const t = this.breakAddresses.get(address);
        if (t) {
            if (t !== x) {
                this.breakAddresses.set(address, 'read write');
            }
        } else {
            this.breakAddresses.set(address, x);
        }
        return true;
    }

    public clearAllDataBreakpoints(): void {
        this.breakAddresses.clear();
    }

    public setExceptionsFilters(namedException: string | undefined, otherExceptions: boolean): void {
        this.namedException = namedException;
        this.otherExceptions = otherExceptions;
    }

    public setInstructionBreakpoint(address: number): boolean {
        this.instructionBreakpoints.add(address);
        return true;
    }

    public clearInstructionBreakpoints(): void {
        this.instructionBreakpoints.clear();
    }

    public async getGlobalVariables(cancellationToken?: () => boolean): Promise<RuntimeVariable[]> {

        let a: RuntimeVariable[] = [];

        // for (let i = 0; i < Simulation.memorySize; i++) {
        //     a.push(new RuntimeVariable(`m${i}`, false, i, this._simulation));
        //     if (cancellationToken && cancellationToken()) {
        //         break;
        //     }
        //     await timeout(1000); // 10ms per byte of memory
        // }

        return a;
    }

    public getLocalVariables(): RuntimeVariable[] {
        // return Array.from(this.variables, ([name, value]) => value);

        return Array.from(this._simulation.getRegisters(), (v: bigint, k: number) => new RuntimeVariable('X' + k, true, k, this._simulation));
    }

    public getLocalVariable(name: string): RuntimeVariable | undefined {
        // return this.variables.get(name);

        let reg = Parser.parseRegister(name);

        if (reg === undefined) {
            return undefined;
        }

        return new RuntimeVariable(name, true, reg, this._simulation);
    }

    /**
     * Return words of the given address range as "instructions"
     */
    public disassemble(address: number, instructionCount: number): RuntimeDisassembledInstruction[] {

        const instructions: RuntimeDisassembledInstruction[] = [];

        for (let a = address; a < address + instructionCount; a++) {
            if (a >= 0 && a < this._simulation.instructionCount) {
                instructions.push({
                    address: a,
                    instruction: this._simulation.getInstructionMnemonic(a),
                    line: this._simulation.getLineNumberFromIndex(a)
                });
            } else {
                instructions.push({
                    address: a,
                    instruction: 'nop'
                });
            }
        }

        return instructions;
    }

    // private methods

    private getLine(line?: number): string {
        return this.sourceLines[line === undefined ? this.currentLine : line].trim();
    }

    private async loadSource(file: string): Promise<void> {
        if (this._sourceFile !== file) {
            // load from file
            this._sourceFile = this.normalizePathAndCasing(file);
            this.initializeContents(await this.fileAccessor.readFile(file));
        }
    }

    private initializeContents(memory: Uint8Array) {
        let sourceText: string = new TextDecoder().decode(memory);

        this._simulation = Parser.parseSimulation(sourceText);

        this.sourceLines = sourceText.split(/\r?\n/);
    }

    /**
     * return true on stop
     */
    private findNextStatement(reverse: boolean, stepEvent?: string): boolean {

        for (let ln = this.currentLine; reverse ? ln >= 0 : ln < this.sourceLines.length; reverse ? ln-- : ln++) {

            // is there a source breakpoint?
            const breakpoints = this.breakPoints.get(this._sourceFile);
            if (breakpoints) {
                const bps = breakpoints.filter(bp => bp.line === ln);
                if (bps.length > 0) {

                    // send 'stopped' event
                    this.sendEvent('stopOnBreakpoint');

                    // the following shows the use of 'breakpoint' events to update properties of a breakpoint in the UI
                    // if breakpoint is not yet verified, verify it now and send a 'breakpoint' update event
                    if (!bps[0].verified) {
                        bps[0].verified = true;
                        this.sendEvent('breakpointValidated', bps[0]);
                    }

                    this.currentLine = ln;
                    return true;
                }
            }

            // const line = this.getLine(ln);
            // if (line.length > 0) {
            //     this.currentLine = ln;
            //     break;
            // }

            let index = this._simulation.getIndexFromLineNumber(ln);
            if (index >= 0) {
                // has an instruction
                this.currentLine = ln;
                break;
            }
        }
        if (stepEvent) {
            this.sendEvent(stepEvent);
            return true;
        }
        return false;
    }

    /**
     * "execute a line" of the readme markdown.
     * Returns true if execution sent out a stopped event and needs to stop.
     */
    private executeLine(ln: number, reverse: boolean): boolean {
        // if this instruction has a breakpoint, stop
        if (this.instructionBreakpoints.has(this.instruction)) {
            this.sendEvent('stopOnInstructionBreakpoint');
            return true;
        }

        // execute the line at the given index
        if (this._simulation.execute(this._simulation.getIndexFromLineNumber(ln))) {
            // line successfully executed

            // update line number
            this.currentLine = this._simulation.executionLineNumber();

            // no problems
            return false;
        }

        // line unsuccessfully executed
        return true;

        // const line = this.getLine(ln);

        // // find variable accesses
        // let reg0 = /\$([a-z][a-z0-9]*)(=(false|true|[0-9]+(\.[0-9]+)?|\".*\"|\{.*\}))?/ig;
        // let matches0: RegExpExecArray | null;
        // while (matches0 = reg0.exec(line)) {
        //     if (matches0.length === 5) {

        //         let access: string | undefined;

        //         const name = matches0[1];
        //         const value = matches0[3];

        //         let v = new RuntimeVariable(name, value);

        //         if (value && value.length > 0) {

        //             if (value === 'true') {
        //                 v.value = true;
        //             } else if (value === 'false') {
        //                 v.value = false;
        //             } else if (value[0] === '"') {
        //                 v.value = value.slice(1, -1);
        //             } else if (value[0] === '{') {
        //                 v.value = [
        //                     new RuntimeVariable('fBool', true),
        //                     new RuntimeVariable('fInteger', 123),
        //                     new RuntimeVariable('fString', 'hello'),
        //                     new RuntimeVariable('flazyInteger', 321)
        //                 ];
        //             } else {
        //                 v.value = parseFloat(value);
        //             }

        //             if (this.variables.has(name)) {
        //                 // the first write access to a variable is the "declaration" and not a "write access"
        //                 access = 'write';
        //             }
        //             this.variables.set(name, v);
        //         } else {
        //             if (this.variables.has(name)) {
        //                 // variable must exist in order to trigger a read access
        //                 access = 'read';
        //             }
        //         }

        //         const accessType = this.breakAddresses.get(name);
        //         if (access && accessType && accessType.indexOf(access) >= 0) {
        //             this.sendEvent('stopOnDataBreakpoint', access);
        //             return true;
        //         }
        //     }
        // }

        // // if 'log(...)' found in source -> send argument to debug console
        // const reg1 = /(log|prio|out|err)\(([^\)]*)\)/g;
        // let matches1: RegExpExecArray | null;
        // while (matches1 = reg1.exec(line)) {
        //     if (matches1.length === 3) {
        //         this.sendEvent('output', matches1[1], matches1[2], this._sourceFile, ln, matches1.index);
        //     }
        // }

        // // if pattern 'exception(...)' found in source -> throw named exception
        // const matches2 = /exception\((.*)\)/.exec(line);
        // if (matches2 && matches2.length === 2) {
        //     const exception = matches2[1].trim();
        //     if (this.namedException === exception) {
        //         this.sendEvent('stopOnException', exception);
        //         return true;
        //     } else {
        //         if (this.otherExceptions) {
        //             this.sendEvent('stopOnException', undefined);
        //             return true;
        //         }
        //     }
        // } else {
        //     // if word 'exception' found in source -> throw exception
        //     if (line.indexOf('exception') >= 0) {
        //         if (this.otherExceptions) {
        //             this.sendEvent('stopOnException', undefined);
        //             return true;
        //         }
        //     }
        // }
    }

    private async verifyBreakpoints(path: string): Promise<void> {

        const bps = this.breakPoints.get(path);
        if (bps) {
            await this.loadSource(path);
            bps.forEach(bp => {
                if (!bp.verified && bp.line < this.sourceLines.length) {
                    const srcLine = this.getLine(bp.line);

                    // if a line is empty or starts with '+' we don't allow to set a breakpoint but move the breakpoint down
                    if (srcLine.length === 0 || srcLine.indexOf('+') === 0) {
                        bp.line++;
                    }
                    // if a line starts with '-' we don't allow to set a breakpoint but move the breakpoint up
                    if (srcLine.indexOf('-') === 0) {
                        bp.line--;
                    }
                    // don't set 'verified' to true if the line contains the word 'lazy'
                    // in this case the breakpoint will be verified 'lazy' after hitting it once.
                    if (srcLine.indexOf('lazy') < 0) {
                        bp.verified = true;
                        this.sendEvent('breakpointValidated', bp);
                    }
                }
            });
        }
    }

    private sendEvent(event: string, ...args: any[]): void {
        setTimeout(() => {
            this.emit(event, ...args);
        }, 0);
    }

    private normalizePathAndCasing(path: string) {
        if (this.fileAccessor.isWindows) {
            return path.replace(/\//g, '\\').toLowerCase();
        } else {
            return path.replace(/\\/g, '/');
        }
    }
}
