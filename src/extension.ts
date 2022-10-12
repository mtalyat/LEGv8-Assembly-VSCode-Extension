import * as vscode from 'vscode';
import { Parser } from './Parser';

export function activate(context: vscode.ExtensionContext) {
	// register commands
	let disposable = vscode.commands.registerCommand('legv8-assembly.runLegV8', () => {

		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const start = editor.selection.start;
			const end = editor.selection.end;

			let sim;

			if (start.isEqual(end)) {
				// if nothing selected, run the entire document
				sim = Parser.parseSimulation(document.getText());
			} else {
				// if something selected, run just the selected code
				sim = Parser.parseSimulation(document.getText(new vscode.Range(start, end)));
			}
		}

		//vscode.window.showInformationMessage('Hello World from LEGv8 Assembly!');
	});

	context.subscriptions.push(disposable);

	console.log("Commands registered.");

	// load core instructions
	Parser.loadCoreInstructions("../resources/core-instructions.csv");

	console.log("Core Instructions loaded.");
}

// This method is called when your extension is deactivated
export function deactivate() { }
