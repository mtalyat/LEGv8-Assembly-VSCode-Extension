import { off } from "process";
import { isBigInt64Array } from "util/types";


export class PackedNumber {
    private value: number;

    public constructor(value: number) {
        this.value = value; // set to given value
    }

    public getNumber(): number {
        return this.value;
    }

    public setNumber(value: number): void {
        this.value = value;
    }

    //#region get

    public get(offset: number, size: number): number {
        return (this.value >> offset) & ((1 << size) - 1);
    }

    public getByte(offset: number, size: number): number {
        return this.get(offset * 8, size * 8);
    }

    public getRange(start: number, end: number): number {
        return this.get(start, end - start + 1);
    }

    public getBit(offset: number): boolean {
        return this.get(offset, 1) !== 0;
    }

    //#endregion

    //#region  set

    public set(offset: number, data: number, size: number): void {
        // get block of 1s so we can use it to mask values
        let c = ((1 << size) - 1);

        // mask current stored value so it clears the new location
        this.value &= ~(c << offset);

        // mask new value and set it to the value
        this.value |= (data & c) << offset;
    }

    public setByte(offset: number, data: number, size: number): void {
        this.set(offset * 8, data, size * 8);
    }

    public setRange(start: number, end: number, data: number): void {
        this.set(start, data, end - start + 1);
    }

    public setBit(offset: number, data: boolean): void {
        this.set(offset, data ? 1 : 0, 1);
    }

    //#endregion

    public toString(padding: number): string {
        if (padding === undefined) {
            return this.value.toString();
        }

        let str = this.value.toString(2);

        if (str.startsWith('-')) {
            // remove negative sign 
            str = str.substring(1);

            // add ones
            return str.padStart(padding, '1');
        } else {
            // add zeros
            return str.padStart(padding, '0');
        }
    }
}