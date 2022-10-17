export class PackedBigInt {
    private value: bigint;

    public constructor(value: bigint) {
        this.value = value; // set to given value
    }

    public getNumber(): bigint {
        return this.value;
    }

    public setNumber(value: bigint): void {
        this.value = value;
    }

    //#region get

    public get(offset: bigint, size: bigint): bigint {
        return (this.value >> offset) & ((1n << size) - 1n);
    }

    public getByte(offset: bigint, size: bigint): number {
        return Number(this.get(offset * 8n, size * 8n));
    }

    public getRange(start: bigint, end: bigint): bigint {
        return this.get(start, end - start + 1n);
    }

    public getBit(offset: bigint): boolean {
        return this.get(offset, 1n) !== 0n;
    }

    //#endregion

    //#region  set

    public set(offset: bigint, data: bigint, size: bigint): void {
        // get block of 1s so we can use it to mask values
        let c = ((1n << size) - 1n);

        // mask current stored value so it clears the new location
        this.value &= ~(c << offset);

        // mask new value and set it to the value
        this.value |= (data & c) << offset;
    }

    public setByte(offset: bigint, data: number, size: bigint): void {
        this.set(offset * 8n, BigInt(data), size * 8n);
    }

    public setRange(start: bigint, end: bigint, data: bigint): void {
        this.set(start, data, end - start + 1n);
    }

    public setBit(offset: bigint, data: boolean): void {
        this.set(offset, data ? 1n : 0n, 1n);
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