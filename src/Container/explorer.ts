import * as vscode from "vscode";
import * as path from "path";

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
  ) {
    super(label, collapsibleState);
    this.contextValue = contextValue;

    // console.log(tooltip)
    this.tooltip = tooltip ? tooltip : `${this.label}`;

    this.explorerId = explorerId;
    this.type = type;
    this.data = data;
    this.lightIconPath = lightIconPath;
    this.darkIconPath = darkIconPath;
  }

  iconPath = {
    light: this.lightIconPath ? this.lightIconPath : path.join("/"),
    dark: this.darkIconPath ? this.darkIconPath : path.join("/")
  };
}
