import * as vscode from "vscode";
import { createAdr } from "./command-create";
import { list } from "./command-list";
import { AdrCodelensNavigationProvider } from "./adr-codelens-navigation-provider";

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "adrutilities" is now active!');

  vscode.commands.registerCommand("adrutilities.list", list);

  vscode.commands.registerCommand("adrutilities.create", createAdr);

	vscode.languages.registerCodeLensProvider("*", new AdrCodelensNavigationProvider());

	vscode.commands.registerCommand("adrutilities.enableCodeLensNavigation", () => {
		vscode.workspace.getConfiguration("adrutilities").update("enableCodeLensNavigation", true, true);
	});

	vscode.commands.registerCommand("adrutilities.disableCodeLensNavigation", () => {
		vscode.workspace.getConfiguration("adrutilities").update("enableCodeLensNavigation", false, true);
	});

	vscode.commands.registerCommand("adrutilities.codelensNavigation", (args: any) => {
    vscode.workspace.openTextDocument(args).then(doc => {
		console.log('Open by CodeLens : '+doc);
      vscode.window.showTextDocument(doc);
    });
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
