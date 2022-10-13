import * as vscode from 'vscode';
import * as path from 'path';
import { Parser } from './Parser';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { CoreInstruction } from './CoreInstruction';
import { Simulation } from './Simulation';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// load core instructions
	Parser.loadCoreInstructions("../resources/core-instructions.csv");

	console.log("Core Instructions loaded.");

	// register commands
	const disposable = vscode.commands.registerCommand('legv8-assembly.runLegV8', () => {

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

			sim.run();
			console.log(`Program executed in ${sim.executionTime()}ms.`);
		}

		//vscode.window.showInformationMessage('Hello World from LEGv8 Assembly!');
	});
	// autofill
	const autofillSnippets = vscode.languages.registerCompletionItemProvider('LEGv8', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			// get options for registers
			let registers: string[] = new Array();
			for (let i = 0; i < Simulation.registerCount; i++) {
				registers.push('X' + i);
			}
			registers.push("IP0");
			registers.push("IP1");
			registers.push("SP");
			registers.push("FP");
			registers.push("LR");
			registers.push("XZR");
			const registerOptions: string = `|${registers.join(',')}|`;

			// generate completion items based on CoreInstructions
			const cores: CoreInstruction[] = Parser.getCoreInstructions();
			let completionItems: vscode.CompletionItem[] = new Array();

			let core: CoreInstruction;
			let format: string;
			let preview: string;
			let argTypes: string;

			let xIndex: number;
			let k: number;
			let sb: string;

			let temp: string;

			for (let i = 0; i < cores.length; i++) {
				core = cores[i];

				format = core.getArgsFormat();
				argTypes = core.getArgTypes();

				xIndex = 0;

				sb = core.getMnemonic().toString() + ' ';
				preview = sb;

				// go through format, replace X with index of the X
				for (let j = 0; j < format.length; j++) {
					k = format.indexOf('_', j);
					k = k === -1 ? format.length : k;

					// add stuff before X
					temp = format.substring(j, k);
					sb += temp;
					preview += temp;

					// replace X with number, add options if necessary
					if (xIndex < argTypes.length) {
						sb += "${" + (xIndex + 1);
						preview += argTypes[xIndex].toUpperCase();
						switch (argTypes[xIndex]) {
							case 'r':
								sb += registerOptions;
								break;
						}
						sb += "}";

						// move to next index
						xIndex++;
					}

					// advance j
					j = k;
				}

				const c = new vscode.CompletionItem(preview);
				c.insertText = new vscode.SnippetString(sb);

				completionItems.push(c);
			}

			// // a simple completion item which inserts `Hello World!`
			// const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			// const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			// snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			// const docs: any = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
			// snippetCompletion.documentation = docs;
			// docs.baseUri = vscode.Uri.parse('http://example.com/a/b/c/');

			// completionItems.push(snippetCompletion);

			// // a completion item that can be accepted by a commit character,
			// // the `commitCharacters`-property is set which means that the completion will
			// // be inserted and then the character will be typed.
			// const commitCharacterCompletion = new vscode.CompletionItem('console');
			// commitCharacterCompletion.commitCharacters = ['.'];
			// commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// // a completion item that retriggers IntelliSense when being accepted,
			// // the `command`-property is set which the editor will execute after
			// // completion has been inserted. Also, the `insertText` is set so that
			// // a space is inserted after `new`
			// const commandCompletion = new vscode.CompletionItem('new');
			// commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			// commandCompletion.insertText = 'new ';
			// commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// // return all completion items as array
			// return [
			// 	simpleCompletion,
			// 	snippetCompletion,
			// 	commitCharacterCompletion,
			// 	commandCompletion
			// ];

			// return them to have them added
			return completionItems;
		}
	});

	// autofill 2
	const provider2 = vscode.languages.registerCompletionItemProvider(
		'LEGv8',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
	// subscribe commands
	context.subscriptions.push(disposable, autofillSnippets, provider2);

	console.log("Commands registered.");

	// connect to language server
	activateLanguageServerProtocol(context);

	console.log("Connected to LSP.");
}

function activateLanguageServerProtocol(context: vscode.ExtensionContext): void {
	let serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

// This method is called when your extension is deactivated
export function deactivate() {
	// stop client, if there is one
	if (!client) {
		return undefined;
	}
	return client.stop();
}
