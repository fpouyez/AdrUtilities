import {workspace, Uri} from "vscode";

export async function list () : Promise<Uri[]> {
    const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix");
    let adrs = await workspace.findFiles('**/*'+prefix+'*.md');
    return adrs;
}