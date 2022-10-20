import * as vscode from 'vscode';

/**
 * Handles printing text that the user can see, within an Output window.
 */
export class Output {
    /**
     * The VSCode Output channel reference that this Output class uses.
     */
    private static _outputChannel: vscode.OutputChannel | null = null;

    /**
     * Gets the Output channel in VSCode that this extension has access to. 
     * Creates a new one if an Output window does not exist for this extension.
     * @returns the VSCode Output channel.
     */
    public static getOutputChannel(): vscode.OutputChannel {
        if (this._outputChannel === null) {
            this._outputChannel = vscode.window.createOutputChannel("LEGv8 Assembly Output");
            console.log("Created Output.");
        }

        return this._outputChannel;
    }

    /**
     * Clears the Output window.
     */
    public static clear(): void {
        this.getOutputChannel().clear();
    }

    /**
     * Prints an error message to the Output window.
     * @param text the text to be printed to the Output window.
     */
    public static error(text: string): void {
        const t = `Error: ${text}`;
        this.writeLine(t);
        console.log(t);
    }

    /**
     * Appends the given text to the Output window.
     * @param text the text to be printed to the Output window.
     */
    public static write(text: string): void {
        // append text
        this.getOutputChannel().append(text);
    }

    /**
     * Appends a line with the given text to the Output window.
     * @param text the text to be printed to the Output window.
     */
    public static writeLine(text?: string): void {
        // append line
        this.getOutputChannel().appendLine(text ?? "");
    }

    /**
     * Shows the Output window in VSCode.
     */
    public static show(): void {
        this.getOutputChannel().show();
    }

    /**
     * Hides the Output window in VSCode.
     */
    public static hide(): void {
        this.getOutputChannel().hide();
    }
}