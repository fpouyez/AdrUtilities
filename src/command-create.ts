import * as vscode from "vscode";
import * as adrStrings from "./adr-string-const";
import { convertSeparators, convertSeparatorsOnUri, separator, findLastDirectoryName } from "./adr-filepath";

const padZero = (num: number, pad: number) => num.toString().padStart(pad, "0");

const concatDate = () => {
	let date = new Date();
	return date.getFullYear() + padZero(date.getMonth() + 1, 2) + padZero(date.getDate(), 2);
};

const createAdrFullPath = (directory: vscode.Uri, adrTitle: string, todayDate: string) => {
	const prefix = vscode.workspace.getConfiguration("adrutilities").get("adrFilePrefix");
	return vscode.Uri.joinPath(directory, prefix + adrTitle + "_" + todayDate + ".md");
};

const createAdrFile = (adrFullPath: vscode.Uri) => {
	let template: string = pickTemplate();
	vscode.workspace.fs.writeFile(adrFullPath, Buffer.from(template));
};

const askForTitle = () =>
	vscode.window.showInputBox({
		title: adrStrings.adrNameInputBoxPlaceHolder,
		placeHolder: adrStrings.adrNameInputBoxPlaceHolder,
	});

const pickTemplate = () => {
	const templateString = vscode.workspace.getConfiguration("adrutilities").get("currentTemplate");
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
		}
	}

	let segments = convertSeparators(uri.fsPath).split(separator);
	let lastDirName = findLastDirectoryName(segments);

	console.log("LastDirName : "+ (lastDirName ? lastDirName : "rien"));

	let config = vscode.workspace.getConfiguration("adrutilities");

	if (lastDirName !== config.adrDirectoryName) {
		segments.push(config.adrDirectoryName);
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
			createAdrFile(fullPath);
		}
	}
}

