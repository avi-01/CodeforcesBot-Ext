import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {Explorer} from '../../Container/explorer';
import { getPastContests } from './Types/pastContest';
import { getFutureContests } from './Types/futureContest';
import { getRunningContests } from './Types/runningContest';
import Problems from './Problems/problems';
import FileHandler from '../../helper/fileHandler/fileHandler';
import { getUserHandle } from '../../helper/data/data';

const resDir = path.join(__filename, "..", "..", "..", "..", "res");
const dataFile = path.join(resDir, "Data", "data.json");

export class ContestsProvider implements vscode.TreeDataProvider<Explorer> {

  userHandle;

  constructor(private workspaceRoot: string) {
    console.log(workspaceRoot);
    this.userHandle = getUserHandle();
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
      return getPastContests(10);
    }

    else if(element.label === 'Future') { 
      return getFutureContests(20);
    }

    else if(element.label === 'Running') { 
      return getRunningContests(20);
    }

    else if(element.type === 'Past' || element.type === 'Running') {
      return this.getContestExplorer(element.explorerId);
    }

    else if(element.label === 'Problems') {
      const contestId = element.explorerId ? element.explorerId : 0;

      const problems = new Problems(this.userHandle, contestId);
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

