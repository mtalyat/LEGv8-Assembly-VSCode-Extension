export class CoreInstruction {
    name: string;

    mnemonic: string;

    format: string;

    opCode: string;

    args: string;

    argTypes: string;

    public constructor(name: string, mnemonic: string, format: string, opCode: string, args: string, argTypes: string) {
        this.name = name;
        const key: string = mnemonic;
        this.mnemonic = mnemonic;
        this.format = format;
        this.opCode = opCode;
        this.args = args;
        this.argTypes = argTypes;
    }

    public toString(): string {
        return `${this.mnemonic} ${this.args}`;
    }
}