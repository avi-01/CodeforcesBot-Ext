import * as vscode from "vscode";
import * as path from "path";

export class Explorer extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly explorerId?: number,
    public readonly description = ""
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = `${this.description}`;

    this.explorerId = explorerId;
  }

  // iconPath = {
  //   light: path.join(__filename, "..", "res", "img", "mainIcon.svg"),
  //   dark: path.join(__filename, "..", "res", "img", "mainIcon.svg"),
  // };
}
