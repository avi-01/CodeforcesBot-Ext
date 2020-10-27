import * as vscode from "vscode";
import * as path from "path";

export class Explorer extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly explorerId?: number,
    public readonly type = "",
    public readonly tooltip?: string,
    public readonly data?: any
  ) {
    super(label, collapsibleState);

    // console.log(tooltip)
    this.tooltip = tooltip ? tooltip : `${this.label}`;

    this.explorerId = explorerId;
    this.type = type;
    this.data = data;
  }

  // iconPath = {
  //   light: path.join(__filename, "..", "res", "img", "mainIcon.svg"),
  //   dark: path.join(__filename, "..", "res", "img", "mainIcon.svg"),
  // };
}
