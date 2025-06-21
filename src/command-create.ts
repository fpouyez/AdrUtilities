import * as vscode from "vscode";
import * as adrStrings from "./adr-string-const";
import { convertSeparators, convertSeparatorsOnUri, separator, findLastDirectoryName } from "./adr-filepath";
import { SecurityValidator } from "./security-validator";

const padZero = (num: number, pad: number) => num.toString().padStart(pad, "0");

const concatDate = () => {
	let date = new Date();
	return date.getFullYear() + padZero(date.getMonth() + 1, 2) + padZero(date.getDate(), 2);
};

const createAdrFullPath = (directory: vscode.Uri, adrTitle: string, todayDate: string) => {
	const prefix = vscode.workspace.getConfiguration("adrutilities").get("adrFilePrefix") as string;
	
	// Validation du préfixe
	if (!SecurityValidator.validateAdrPrefix(prefix)) {
		throw new Error('Préfixe ADR invalide dans la configuration');
	}
	
	// Génération sécurisée du nom de fichier
	const fileName = SecurityValidator.generateSecureFileName(adrTitle, prefix, todayDate);
	return vscode.Uri.joinPath(directory, fileName);
};

const createAdrFile = async (adrFullPath: vscode.Uri) => {
	try {
		let template: string = pickTemplate();
		await vscode.workspace.fs.writeFile(adrFullPath, Buffer.from(template));
	} catch (error) {
		throw new Error(`Erreur lors de la création du fichier ADR: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
	}
};

const askForTitle = async () => {
	const title = await vscode.window.showInputBox({
		title: adrStrings.adrNameInputBoxTitle,
		placeHolder: adrStrings.adrNameInputBoxPlaceHolder,
		validateInput: (value) => {
			if (!SecurityValidator.validateAdrTitle(value)) {
				return 'Le titre doit contenir uniquement des lettres, chiffres, espaces, tirets et underscores (1-100 caractères)';
			}
			return null;
		}
	});
	
	return title ? SecurityValidator.sanitizeAdrTitle(title) : null;
};

const pickTemplate = () => {
	const templateString = vscode.workspace.getConfiguration("adrutilities").get("currentTemplate") as string;
	let template: string;
	if (templateString === 'defaultTemplateFrench') {
		template = adrStrings.defaultTemplateFrench;
	}
	else {
		template = adrStrings.defaultTemplateEnglish;
	}
	return template;
};

export async function createAdr(uri: vscode.Uri): Promise<void> {
	try {
		console.log("Create initial dir : "+uri);
		if (!uri) {
			let parentDirectory = vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				title: adrStrings.adrChooseDirectoryBoxTitle,
			});
			let response = await parentDirectory;
			if (!!response) {
				uri = response[0];
			} else {
				throw new Error('Aucun répertoire sélectionné');
			}
		}

		// Validation du chemin URI
		if (!SecurityValidator.validateFilePath(uri.fsPath)) {
			throw new Error('Chemin de répertoire invalide ou en dehors de l\'espace de travail');
		}

		let segments = convertSeparators(uri.fsPath).split(separator);
		let lastDirName = findLastDirectoryName(segments);

		console.log("LastDirName : "+ (lastDirName ? lastDirName : "rien"));

		let config = vscode.workspace.getConfiguration("adrutilities");
		const adrDirectoryName = config.get("adrDirectoryName") as string;

		// Validation du nom de répertoire ADR
		if (!SecurityValidator.validateAdrDirectoryName(adrDirectoryName)) {
			throw new Error('Nom de répertoire ADR invalide dans la configuration');
		}

		if (lastDirName !== adrDirectoryName) {
			segments.push(adrDirectoryName);
		}

		uri = vscode.Uri.parse(
			segments.reduce((acc, segment) => {
				return acc + segment + separator;
			})
		);

		if (!!uri) {
			console.log("Create in directory : "+uri);
			let adrTitle = await askForTitle();
			if (!!adrTitle) {
				let today = concatDate();
				let uriPath = createAdrFullPath(uri, adrTitle, today);
				console.log("Create uriPath : "+uriPath);
				let fullPath = convertSeparatorsOnUri(uriPath);
				console.log("Create : "+fullPath.fsPath);
				await createAdrFile(fullPath);
				
				vscode.window.showInformationMessage(`ADR créé avec succès: ${adrTitle}`);
			}
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de l\'ADR';
		vscode.window.showErrorMessage(errorMessage);
		console.error('Erreur lors de la création de l\'ADR:', error);
	}
}

