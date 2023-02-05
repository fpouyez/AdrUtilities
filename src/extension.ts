// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as adrStrings from "./adr-string-const";

const padZero = (num: number, pad: number) => num.toString().padStart(pad, "0");
const concatDate = () => {
  let date = new Date();
  return (
    date.getFullYear() +
    padZero(date.getMonth() + 1, 2) +
    padZero(date.getDate(), 2)
  );
};
const createAdrFullPath = (
  directory: vscode.Uri,
  adrTitle: string,
  todayDate: string
) =>
  vscode.Uri.joinPath(directory, "ADR_" + adrTitle + "_" + todayDate + ".md");
const createAdrFile = (adrFullPath: vscode.Uri) =>
  vscode.workspace.fs.writeFile(adrFullPath, Buffer.from(adrStrings.template));

const askForTitle = () =>
  vscode.window.showInputBox({
    title: adrStrings.adrNameInputBoxPlaceHolder,
    placeHolder: adrStrings.adrNameInputBoxPlaceHolder,
  });


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "adrutilities" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  vscode.commands.registerCommand("adrutilities.adr", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage(
      "Hello World from adrutilities! Eh ouais !"
    );
  });

  vscode.commands.registerCommand("adrutilities.create.adr", async (uri:vscode.Uri) => {

	if(!uri){
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

	let segments = uri.fsPath.split('/');
	let lastDirName;
	let lastSegment = segments.at(-1);

	if(!!lastSegment && lastSegment.indexOf('.') > 0){
		lastDirName = segments.pop()?.at(-1);
	} else {
	 	lastDirName = lastSegment;
	}

	if(lastDirName !== adrStrings.adrDirectoryName){
		segments.push(adrStrings.adrDirectoryName);
		uri = vscode.Uri.parse(segments.reduce((acc, segment)=> {return acc+segment+'/';}));
	}

    if (!!uri) {
      let adrTitle = await askForTitle();
      if (!!adrTitle) {
        let today = concatDate();
        let fullPath = createAdrFullPath(uri, adrTitle, today);
        createAdrFile(fullPath);
      }
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
