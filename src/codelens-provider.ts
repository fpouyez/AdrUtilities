import * as vscode from "vscode";
import { list } from "./command-list";

export class AdrCodelensNavigationProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /.?ADR_.+\.md/g;

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (
      vscode.workspace
        .getConfiguration("adrutilities")
        .get("enableCodeLensNavigation", true)
    ) {
      this.codeLenses = [];
      const regex = new RegExp(this.regex);
      const text = document.getText();
      let matches;
      while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const position = new vscode.Position(line.lineNumber, indexOf);
        const range = document.getWordRangeAtPosition(
          position,
          new RegExp(this.regex)
        );
        if (range) {
          this.codeLenses.push(new vscode.CodeLens(range));
        }
      }
      return this.codeLenses;
    }
    return [];
  }

  public async resolveCodeLens(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ) {
    if (
      vscode.workspace
        .getConfiguration("adrutilities")
        .get("enableCodeLensNavigation", true)
    ) {
      var editor = vscode.window.activeTextEditor;
      if (!editor) {
        token.isCancellationRequested = true;
        return; // No open text editor
      }

      var text = editor.document.getText(codeLens.range).trim();
      let listAdr = await list();
      let indexUri = -1;
      for (let index = 0; index < listAdr.length; index++) {
        const element = listAdr[index];
        if (element.fsPath.indexOf(text) >= 0) {
          indexUri = index;
          break;
        }
      }

      if (indexUri >= 0) {
        codeLens.command = {
          title: "Open this ADR",
          tooltip: "Open this ADR in a new tab",
          command: "adrutilities.codelensNavigation",
          arguments: [listAdr[indexUri]],
        };
        return codeLens;
      }
    }
    return;
  }
}
