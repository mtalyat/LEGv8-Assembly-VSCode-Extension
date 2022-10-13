/**
 * Represents a line of text from an assembly file.
 */
export class Line {
    /**
     * The text on the line that appears before the first instance of a space.
     */
    private _label: string;

    /**
     * The arguments of the line that appear after the label, until the end of the line.
     */
    private _rawArgs: string;

    /**
     * The line number in the text document that this Line is from.
     */
    private _lineNumber: number;

    /**
     * Creates a new Line from the given text and line number.
     * @param text the raw text that this Line consists of.
     * @param lineNumber the number of the line that this Line is from in the file.
     */
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

    /**
     * Gets the label for this Line.
     * @returns the label/first word within this Line.
     */
    public getLabel(): string {
        return this._label;
    }

    /**
     * Gets the args for this Line.
     * @returns the args/text after the label within this Line.
     */
    public getArgs(): string {
        return this._rawArgs;
    }

    /**
     * Gets the line number for this Line.
     * @returns the line number.
     */
    public getLineNumber(): number {
        return this._lineNumber;
    }

    /**
     * Checks if the label and args are both empty.
     * @returns true of this Line is empty.
     */
    public isEmpty(): boolean {
        return this._label.length === 0 && this._rawArgs.length === 0;
    }

    /**
     * Converts this Line into a readable string.
     * @returns a readable string representation of this Line.
     */
    public toString(): string {
        return `${this._lineNumber}\t${this._label} ${this._rawArgs}`;
    }
}