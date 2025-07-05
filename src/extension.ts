import * as vscode from "vscode";
import { createAdr } from "./command-create";
import { registerPreviewTemplateCommand } from "./command-preview-template";
import { list } from "./command-list";
import { AdrCodelensNavigationProvider } from "./adr-codelens-navigation-provider";

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "adrutilities" is now active!');

  try {
    // Enregistrement des commandes avec gestion d'erreurs
    const listCommand = vscode.commands.registerCommand("adrutilities.list", async () => {
      try {
        const adrs = await list();
        
        if (adrs.length === 0) {
          vscode.window.showInformationMessage('Aucun ADR trouvé dans le workspace');
          return [];
        }
        
        // Créer une liste détaillée des ADR avec chemin relatif
        const adrItems = adrs.map(uri => {
          const path = uri.fsPath;
          const fileName = path.split(/[\\/]/).pop() || path;
          const relativePath = vscode.workspace.asRelativePath(uri);
          return {
            label: fileName,
            description: relativePath,
            detail: path,
            uri: uri
          };
        });
        
        // Afficher un message avec le nombre d'ADR trouvés
        vscode.window.showInformationMessage(`${adrs.length} ADR(s) trouvé(s) dans le workspace`);
        
        // Afficher la liste complète des ADR avec plus d'informations
        if (adrs.length === 1) {
          // Si un seul ADR, l'ouvrir directement
          const doc = await vscode.workspace.openTextDocument(adrs[0]);
          await vscode.window.showTextDocument(doc);
        } else if (adrs.length > 1) {
          // Si plusieurs ADR, proposer une sélection avec plus d'informations
          const selected = await vscode.window.showQuickPick(adrItems, {
            placeHolder: 'Sélectionnez un ADR à ouvrir',
            matchOnDescription: true,
            matchOnDetail: true
          });
          
          if (selected) {
            const doc = await vscode.workspace.openTextDocument(selected.uri);
            await vscode.window.showTextDocument(doc);
          }
        }
        
        return adrs;
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

    // Déclaration du provider CodeLens au niveau de la fonction
    let codeLensProvider: AdrCodelensNavigationProvider | undefined;

    const enableCodeLensCommand = vscode.commands.registerCommand("adrutilities.enableCodeLensNavigation", async () => {
      try {
        await vscode.workspace.getConfiguration("adrutilities").update("enableCodeLensNavigation", true, true);
        
        // Enregistrer le provider si pas déjà fait
        if (!codeLensProvider) {
          codeLensProvider = new AdrCodelensNavigationProvider();
          // Les CodeLens doivent fonctionner sur tous les types de fichiers pour transformer les commentaires en liens
          vscode.languages.registerCodeLensProvider("*", codeLensProvider);
        }
        
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
        
        // Note: Le provider ne peut pas être désenregistré dynamiquement dans VS Code
        // Il sera désactivé via la configuration dans le provider
        vscode.window.showInformationMessage('Navigation CodeLens ADR désactivée');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la désactivation de la navigation CodeLens';
        vscode.window.showErrorMessage(errorMessage);
        console.error('Erreur lors de la désactivation de la navigation CodeLens:', error);
      }
    });

    const codelensNavigationCommand = vscode.commands.registerCommand("adrutilities.codelensNavigation", async (args: vscode.Uri) => {
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
    try {
      // Vérifier si les CodeLens doivent être activés au démarrage
      const enableCodeLens = vscode.workspace.getConfiguration("adrutilities").get("enableCodeLensNavigation", true);
      
      // Le CodeLens s'active automatiquement si enableCodeLensNavigation est true (défaut)
      if (enableCodeLens) {
        codeLensProvider = new AdrCodelensNavigationProvider();
        // Les CodeLens doivent fonctionner sur tous les types de fichiers pour transformer les commentaires en liens
        vscode.languages.registerCodeLensProvider("*", codeLensProvider);
      }
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

    // Enregistrement de la commande de prévisualisation du template ADR
    registerPreviewTemplateCommand(context);

  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'extension:', error);
    vscode.window.showErrorMessage('Erreur lors de l\'activation de l\'extension ADR Utilities');
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log('Extension ADR Utilities désactivée');
}
