import * as vscode from "vscode";
import { createAdr } from "./command-create";
import { list } from "./command-list";
import { AdrCodelensNavigationProvider } from "./adr-codelens-navigation-provider";

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "adrutilities" is now active!');

  try {
    // Enregistrement des commandes avec gestion d'erreurs
    const listCommand = vscode.commands.registerCommand("adrutilities.list", async () => {
      try {
        return await list();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du listing des ADR';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors du listing des ADR:', error);
        return [];
      }
    });

    const createCommand = vscode.commands.registerCommand("adrutilities.create", async (uri: vscode.Uri) => {
      try {
        await createAdr(uri);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de l\'ADR';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors de la création de l\'ADR:', error);
      }
    });

    const enableCodeLensCommand = vscode.commands.registerCommand("adrutilities.enableCodeLensNavigation", async () => {
      try {
        await vscode.workspace.getConfiguration("adrutilities").update("enableCodeLensNavigation", true, true);
        vscode.window.showInformationMessage('Navigation CodeLens ADR activée');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'activation de la navigation CodeLens';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors de l\'activation de la navigation CodeLens:', error);
      }
    });

    const disableCodeLensCommand = vscode.commands.registerCommand("adrutilities.disableCodeLensNavigation", async () => {
      try {
        await vscode.workspace.getConfiguration("adrutilities").update("enableCodeLensNavigation", false, true);
        vscode.window.showInformationMessage('Navigation CodeLens ADR désactivée');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la désactivation de la navigation CodeLens';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors de la désactivation de la navigation CodeLens:', error);
      }
    });

    const codelensNavigationCommand = vscode.commands.registerCommand("adrutilities.codelensNavigation", async (args: any) => {
      try {
        if (!args || !args.fsPath) {
          throw new Error('Arguments invalides pour la navigation CodeLens');
        }
        
        const doc = await vscode.workspace.openTextDocument(args);
        console.log('Open by CodeLens : '+doc);
        await vscode.window.showTextDocument(doc);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ouverture du document ADR';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors de l\'ouverture du document ADR:', error);
      }
    });

    // Enregistrement du provider CodeLens avec gestion d'erreurs
    let codeLensProvider: AdrCodelensNavigationProvider;
    try {
      codeLensProvider = new AdrCodelensNavigationProvider();
      vscode.languages.registerCodeLensProvider("*", codeLensProvider);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du provider CodeLens:', error);
      vscode.window.showErrorMessage('Erreur lors de l\'initialisation de la navigation CodeLens');
    }

    // Ajout des commandes au contexte pour la désactivation
    context.subscriptions.push(
      listCommand,
      createCommand,
      enableCodeLensCommand,
      disableCodeLensCommand,
      codelensNavigationCommand
    );

  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'extension:', error);
    vscode.window.showErrorMessage('Erreur lors de l\'activation de l\'extension ADR Utilities');
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log('Extension ADR Utilities désactivée');
}
