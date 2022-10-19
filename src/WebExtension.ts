import * as vscode from 'vscode';
import { activateLEGv8Debug } from './ActivateLEGv8Debug';

export function activate(context: vscode.ExtensionContext) {
    activateLEGv8Debug(context);	// activateMockDebug without 2nd argument launches the Debug Adapter "inlined"
}

export function deactivate() {
    // nothing to do
}