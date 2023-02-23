import { Command } from "vscode";

export class CodeLensEmptyCommand implements Command
{
    readonly title = "ADR not found";
    readonly tooltip = "This ADR was not found in this workspace";
    readonly command = "";
}