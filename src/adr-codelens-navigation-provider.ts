import { workspace, CodeLens, CodeLensProvider, TextDocument, CancellationToken, Position, window, TextEditor } from "vscode";
import { list } from "./command-list";
import { CodeLensEmptyCommand } from "./model/codelens-empty-command";
import { CodeLensNavigationCommand } from "./model/codelens-navigation-command";
import { SecurityValidator } from "./security-validator";

function adrRegexBuilder(): RegExp {
	const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix") as string;
	
	// Validation et échappement du préfixe
	if (!SecurityValidator.validateAdrPrefix(prefix)) {
		// Utilise un préfixe par défaut sécurisé si la configuration est invalide
		const safePrefix = SecurityValidator.escapeRegex("adr_");
		return new RegExp(".?" + safePrefix + ".+.md", "g");
	}
	
	const escapedPrefix = SecurityValidator.escapeRegex(prefix);
	return new RegExp(".?" + escapedPrefix + ".+.md", "g");
}

export class AdrCodelensNavigationProvider implements CodeLensProvider {
	private codeLenses: CodeLens[] = [];
	private regex: RegExp;
	private documentCache: Map<string, { codeLenses: CodeLens[], version: number }> = new Map();

	// Commentaire de construction
	constructor() {
		this.regex = adrRegexBuilder();
		this.setupCacheCleanup();
	}

	/**
	 * Configure le nettoyage automatique du cache pour éviter les fuites mémoire
	 */
	private setupCacheCleanup(): void {
		// Nettoyer le cache toutes les 5 minutes
		setInterval(() => {
			this.documentCache.clear();
		}, 5 * 60 * 1000);
	}

	public provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]> {
		try {
			if (this.isCodeLensNavigationActivated()) {
				// Optimisation : vérification du cache
				const documentKey = document.uri.toString();
				const cached = this.documentCache.get(documentKey);
				
				if (cached && cached.version === document.version) {
					return cached.codeLenses;
				}
				
				// Optimisation : vérification rapide avant traitement complet
				const text = document.getText();
				const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix") as string;
				
				// Vérification simple si le document contient des références ADR
				if (!text.includes(prefix)) {
					this.documentCache.set(documentKey, { codeLenses: [], version: document.version });
					return [];
				}
				
				this.codeLenses = [];
				const regex = new RegExp(this.regex);
				let matches;
				
				// Protection contre les expressions régulières malveillantes
				const maxMatches = 1000; // Limite pour éviter les attaques par déni de service
				let matchCount = 0;
				
				while ((matches = regex.exec(text)) !== null && matchCount < maxMatches) {
					this.registerInCodelLensArray(document, matches);
					matchCount++;
				}
				
				// Mise en cache du résultat
				this.documentCache.set(documentKey, { codeLenses: [...this.codeLenses], version: document.version });
				
				return this.codeLenses;
			}
			return [];
		} catch (error) {
			console.error('Erreur lors de la génération des CodeLens:', error);
			return [];
		}
	}

	private isCodeLensNavigationActivated() {
		return workspace.getConfiguration("adrutilities").get("enableCodeLensNavigation", true);
	}

	private registerInCodelLensArray(document: TextDocument, matches: RegExpExecArray) {
		try {
			const range = this.calculateRange(document, matches);
			if (range) {
				this.codeLenses.push(new CodeLens(range));
			}
		} catch (error) {
			console.error('Erreur lors de l\'enregistrement du CodeLens:', error);
		}
	}

	private calculateRange(document: TextDocument, matches: RegExpExecArray) {
		try {
			const line = document.lineAt(document.positionAt(matches.index).line);
			const indexOf = line.text.indexOf(matches[0]);
			
			if (indexOf === -1) {
				return null;
			}
			
			const position = new Position(line.lineNumber, indexOf);
			const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
			return range;
		} catch (error) {
			console.error('Erreur lors du calcul de la plage:', error);
			return null;
		}
	}

	public async resolveCodeLens(codeLens: CodeLens, token: CancellationToken) {
		try {
			if (this.isCodeLensNavigationActivated()) {
				const editor = window.activeTextEditor;
				if (!editor) {
					token.isCancellationRequested = true;
					return codeLens; // No open text editor
				}

				const uri = await this.findAdrUri(editor, codeLens);
				console.log('CodeLens - ADR Uri : '+uri);
				if (uri) {
					codeLens.command = new CodeLensNavigationCommand(uri);
					return codeLens;
				}
			}
			codeLens.command = new CodeLensEmptyCommand();
			return codeLens;
		} catch (error) {
			console.error('Erreur lors de la résolution du CodeLens:', error);
			codeLens.command = new CodeLensEmptyCommand();
			return codeLens;
		}
	}

	private async findAdrUri(editor: TextEditor, codeLens: CodeLens) {
		try {
			const text = editor.document.getText(codeLens.range).trim();
			
			// Validation du texte extrait
			if (!text || text.length > 200) { // Limite de longueur pour éviter les attaques
				return null;
			}
			
			const listAdr = await list();
			return listAdr.find((value) => {
				try {
					return value.fsPath.indexOf(text) >= 0;
				} catch (error) {
					console.error('Erreur lors de la recherche d\'ADR:', error);
					return false;
				}
			});
		} catch (error) {
			console.error('Erreur lors de la recherche d\'URI ADR:', error);
			return null;
		}
	}
}
