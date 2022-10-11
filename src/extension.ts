import * as vscode from 'vscode';
import { Simulation } from './Simulation';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('legv8-assembly.runLegV8', () => {

		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const text = document.getText();

			const sim = new Simulation(text);
			sim.print();
		} else {
			console.log("No editor open.");
		}

		//vscode.window.showInformationMessage('Hello World from LEGv8 Assembly!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
