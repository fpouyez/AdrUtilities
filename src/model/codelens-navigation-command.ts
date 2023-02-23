import { Command, Uri } from "vscode";

export class CodeLensNavigationCommand implements Command
{
    readonly title = "Open this ADR";
    readonly tooltip = "Open this ADR in a new tab";
    readonly command = "adrutilities.codelensNavigation";
    readonly arguments?: any[];
    
    constructor(uri: Uri) {
        this.arguments = [uri];
    }
}