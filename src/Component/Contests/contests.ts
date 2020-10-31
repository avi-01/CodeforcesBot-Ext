import * as vscode from 'vscode';

import {Explorer} from '../../Container/explorer';
import Problems from './Problems/problems';
import { getUserHandle } from '../../helper/data/data';
import { getContests } from './allContest';

export class ContestsProvider implements vscode.TreeDataProvider<Explorer> {

  private rootPath;

  constructor(private workspaceRoot: string) {
    console.log(workspaceRoot);
    this.rootPath = workspaceRoot;

    const file = vscode.workspace.findFiles("Codeforces/1437*/A/A.cpp").then((file) => {
      console.log(file);
    });

  }

  getTreeItem(element: Explorer): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Explorer): Thenable<Explorer[]> {
    console.log(element);
    if(!element) {
      return this.getContestTypeExplorer();
    }

    else if(element.label === 'Past') { 
      return getContests(element.label,10,vscode.TreeItemCollapsibleState.Collapsed);
    }

    else if(element.label === 'Running') { 
      return getContests(element.label,20,vscode.TreeItemCollapsibleState.Collapsed);
    }

    else if(element.label === 'Future') { 
      return getContests(element.label,20,vscode.TreeItemCollapsibleState.None);
    }

    else if(element.type === 'Past' || element.type === 'Running') {
      return this.getContestExplorer(element.explorerId);
    }

    else if(element.label === 'Problems') {
      const contestId = element.explorerId ? element.explorerId : 0;

      const problems = new Problems(getUserHandle(), contestId);
      return problems.fetchProblems().then(() => {
        return problems.toExplorer();
      });
    }

    else {
      return Promise.resolve([]);
    }
  }

  getContestTypeExplorer(): Thenable<Explorer[]> {
    let contestExplorers = [];

    contestExplorers.push(new Explorer("Running", "ContestType", vscode.TreeItemCollapsibleState.Expanded));
    contestExplorers.push(new Explorer("Future", "ContestType", vscode.TreeItemCollapsibleState.Collapsed));
    contestExplorers.push(new Explorer("Past", "ContestType", vscode.TreeItemCollapsibleState.Collapsed));

    return Promise.resolve(
      contestExplorers
    );
  }

  getContestExplorer(contestId: number | undefined): Thenable<Explorer[]> {
    let contestExplorers = [];

    contestExplorers.push(new Explorer("Standing", "Standing", vscode.TreeItemCollapsibleState.Collapsed, contestId));
    contestExplorers.push(new Explorer("Problems", "Problems", vscode.TreeItemCollapsibleState.Expanded, contestId));

    return Promise.resolve(
      contestExplorers
    );
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Explorer | undefined> = new vscode.EventEmitter<Explorer | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Explorer | undefined> = this._onDidChangeTreeData.event;

  public refresh(): void {
    console.log("Event");
    console.log(this.onDidChangeTreeData);
		this._onDidChangeTreeData.fire(undefined);
  }

}

