export class Line {
    // the first thing in the string
    private _label: string;

    // arguments in string form
    private _rawArgs: string;

    private _lineNumber: number;

    public constructor(text: string, lineNumber: number) {
        if (text) {
            // split incoming line by the first space
            let splitIndex = text.indexOf(" ");

            if (text.length === 0 || splitIndex < 0 || splitIndex >= text.length - 1) {
                // if no split, it all goes in the label
                this._label = text;
                this._rawArgs = "";
            } else {
                // there is a split, put it in both label and args
                this._label = text.substring(0, splitIndex);
                this._rawArgs = text.substring(splitIndex + 1, text.length);
            }
        } else {
            //no text given
            this._label = "";
            this._rawArgs = "";
        }

        this._lineNumber = lineNumber;
    }

    // gets the label for this line
    public getLabel(): string {
        return this._label;
    }

    public getArgs(): string {
        return this._rawArgs;
    }

    public getLineNumber(): number {
        return this._lineNumber;
    }

    public isEmpty(): boolean {
        return this._label.length === 0 && this._rawArgs.length === 0;
    }

    public toString(): string {
        return `${this._lineNumber}\t${this._label} ${this._rawArgs}`;
    }
}