import { Parser } from './Parser';

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

    public getLineNumber(): number {
        return this._lineNumber;
    }

    public hasFormatting(formatting: string, types: string): boolean {
        //split up
        let splitFormatting = formatting.split(new RegExp('[{}]'));
        if (splitFormatting.length >= 3) {
            splitFormatting = splitFormatting.splice(1, splitFormatting.length - 2); // remove beginning and end
        }

        // even indices are the numbers
        // odd indices are the splits

        // check if the raw arguments follows the given formatting
        let typeIndex = 0;
        let splitIndex = 1;
        let j: number;
        let inside: string;
        let value: number;

        for (let i = 0; i < this._rawArgs.length; i++, typeIndex += 2, splitIndex += 2) {
            // find next split location
            if (splitIndex >= splitFormatting.length) {
                // if out of things to split by, go to end
                j = this._rawArgs.length;
            } else {
                // split by next thing to split by
                j = this._rawArgs.indexOf(splitFormatting[splitIndex], i);
            }

            // get the inside
            inside = this._rawArgs.substring(i, j).trim();

            // parse based on type
            switch (types[parseInt(splitFormatting[typeIndex])]) {
                case 'r': // register
                    value = Parser.parseRegister(inside);
                    break;
                case 'i': // immediate (number)
                    value = Parser.parseImmediate(inside);
                    break;
                case 'l': // label
                    value = Parser.parseLabel(inside);
                    break;
                default:
                    value = -1;
                    break;
            }

            // did we get an invalid result?
            if (value < 0) {
                console.log(`Invalid parse: "${inside}" of type ${types[parseInt(splitFormatting[typeIndex])]}`);
                return false;
            }

            // catch i up to j
            if (splitIndex >= splitFormatting.length) {
                // end of loop
                break;
            } else {
                i = j + splitFormatting[splitIndex].length - 1;
            }

        }

        // must be valid
        return true;
    }

    public isEmpty(): boolean {
        return this._label.length === 0 && this._rawArgs.length === 0;
    }

    public toString(): string {
        return `${this._lineNumber}\t${this._label} ${this._rawArgs}`;
    }
}