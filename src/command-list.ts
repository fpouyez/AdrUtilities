import {workspace, Uri} from "vscode";
import { separator, convertSeparators } from "./adr-filepath";

export async function list () : Promise<Uri[]> {
    const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix");
    let adrs = await workspace.findFiles('**'+separator()+'*'+prefix+'*.md');
    return adrs.map(value =>  Uri.parse(convertSeparators(value.fsPath)));
}