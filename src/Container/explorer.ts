import * as vscode from "vscode";

export class Explorer extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly contextValue: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly explorerId?: number,
    public readonly type = "",
    public readonly tooltip?: string,
    public readonly data?: any,
    public readonly lightIconPath?: string,
    public readonly darkIconPath?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.contextValue = contextValue;

    // console.log(tooltip)
    this.tooltip = tooltip ? tooltip : `${this.label}`;

    this.explorerId = explorerId;
    this.type = type;
    this.data = data;

    if (lightIconPath) {
      this.iconPath = {
        light: lightIconPath,
        dark: darkIconPath,
      };
    }


    this.command = command;
  }
}
