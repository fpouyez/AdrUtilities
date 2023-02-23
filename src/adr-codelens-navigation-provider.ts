import { workspace, CodeLens, CodeLensProvider, TextDocument, CancellationToken, Position, window, commands, TextEditor } from "vscode";
import { list } from "./command-list";
import { CodeLensEmptyCommand } from "./model/codelens-empty-command";
import { CodeLensNavigationCommand } from "./model/codelens-navigation-command";

function adrRegexBuilder(): RegExp {
	const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix");
	return new RegExp(".?" + prefix + ".+.md", "g");
}

export class AdrCodelensNavigationProvider implements CodeLensProvider {
	private codeLenses: CodeLens[] = [];
	private regex: RegExp;

	constructor() {
		this.regex = adrRegexBuilder();
	}

	public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
		if (this.isCodeLensNavigationActivated()) {
			this.codeLenses = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
			let matches;
			while ((matches = regex.exec(text)) !== null) {
				this.registerInCodelLensArray(document, matches);
			}
			return this.codeLenses;
		}
		return [];
	}

	private isCodeLensNavigationActivated() {
		return workspace.getConfiguration("adrutilities").get("enableCodeLensNavigation", true);
	}

	private registerInCodelLensArray(document: TextDocument, matches: RegExpExecArray) {
		const range = this.calculateRange(document, matches);
		if (range) {
			this.codeLenses.push(new CodeLens(range));
		}
	}

	private calculateRange(document: TextDocument, matches: RegExpExecArray) {
		const line = document.lineAt(document.positionAt(matches.index).line);
		const indexOf = line.text.indexOf(matches[0]);
		const position = new Position(line.lineNumber, indexOf);
		const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
		return range;
	}

	public async resolveCodeLens(codeLens: CodeLens, token: CancellationToken) {
		if (this.isCodeLensNavigationActivated()) {
			var editor = window.activeTextEditor;
			if (!editor) {
				token.isCancellationRequested = true;
				return; // No open text editor
			}

			const uri = await this.findAdrUri(editor, codeLens);

			if (uri) {
				codeLens.command = new CodeLensNavigationCommand(uri);
				return codeLens;
			}
		}
		codeLens.command = new CodeLensEmptyCommand();
		return codeLens;
	}

	private async findAdrUri(editor: TextEditor, codeLens: CodeLens) {
		var text = editor.document.getText(codeLens.range).trim();
		let listAdr = await list();
		return listAdr.find((value)=> value.fsPath.indexOf(text) >= 0);
	}
}
