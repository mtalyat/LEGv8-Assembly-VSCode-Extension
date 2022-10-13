import * as vscode from 'vscode';

export class Output {
    private static _outputChannel: vscode.OutputChannel | null = null;

    public static getOutputChannel(): vscode.OutputChannel {
        if (this._outputChannel === null) {
            this._outputChannel = vscode.window.createOutputChannel("LEGv8 Day");
            console.log("Created Output.");
        }

        return this._outputChannel;
    }

    public static clear(): void {
        this.getOutputChannel().clear();
    }

    public static error(text: string): void {
        this.writeLine("ERROR: " + text);
    }

    public static write(text: string): void {
        this.getOutputChannel().append(text);
    }

    public static writeLine(text: string): void {
        this.getOutputChannel().appendLine(text);
    }

    public static show(): void {
        this.getOutputChannel().show();
    }

    public static hide(): void {
        this.getOutputChannel().hide();
    }
}