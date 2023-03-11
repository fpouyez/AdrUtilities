import {workspace, Uri} from "vscode";
import { separator, convertSeparators } from "./adr-filepath";

export async function list () : Promise<Uri[]> {
    const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix");
    console.log('List - Prefix : '+prefix);
    const pattern = '**'+separator+'*'+prefix+'*.md';
    console.log('List - GlobPattern : '+pattern);
    let adrs = await workspace.findFiles(pattern);
    
    return adrs.map(value => {
        console.log('List - ADR before convert : '+value.fsPath);
        console.log('List - ADR after convert : '+ convertSeparators(value.fsPath));
         return Uri.file(convertSeparators(value.fsPath));
        });
}