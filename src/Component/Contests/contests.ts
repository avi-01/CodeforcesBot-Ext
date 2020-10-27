import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {Explorer} from '../../Container/explorer';
import { getPastContests } from './Types/pastContest';
import { getFutureContests } from './Types/futureContest';
import { getRunningContests } from './Types/runningContest';
import getProblems from './Problems/problems';

export class ContestsProvider implements vscode.TreeDataProvider<Explorer> {
  
  constructor(private workspaceRoot: string) {
    console.log(workspaceRoot);
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
      const contestId = element.explorerId;

      return getProblems(contestId);
    }

    else {
      return Promise.resolve([]);
    }
  }

  getContestTypeExplorer(): Thenable<Explorer[]> {
    let contestExplorers = [];

    contestExplorers.push(new Explorer("Running", vscode.TreeItemCollapsibleState.Expanded));
    contestExplorers.push(new Explorer("Future", vscode.TreeItemCollapsibleState.Collapsed));
    contestExplorers.push(new Explorer("Past", vscode.TreeItemCollapsibleState.Collapsed));

    return Promise.resolve(
      contestExplorers
    );
  }

  getContestExplorer(contestId: number | undefined): Thenable<Explorer[]> {
    let contestExplorers = [];

    contestExplorers.push(new Explorer("Standing", vscode.TreeItemCollapsibleState.Collapsed, contestId));
    contestExplorers.push(new Explorer("Problems", vscode.TreeItemCollapsibleState.Expanded, contestId));

    return Promise.resolve(
      contestExplorers
    );
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Explorer | undefined> = new vscode.EventEmitter<Explorer | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Explorer | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
		// this._onDidChangeTreeData.fire();
	}

}

