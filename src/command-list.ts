import * as vscode from "vscode";

export async function list () : Promise<vscode.Uri[]> {
    let adrs = await vscode.workspace.findFiles('**/*ADR*.md');
    adrs.map((value) => console.log(value));
    return adrs;
}