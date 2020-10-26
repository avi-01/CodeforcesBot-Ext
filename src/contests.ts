import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import {Explorer} from './Container/explorer';
import { getPastContests } from './Component/pastContest';
import { getFutureContests } from './Component/futureContest';

export class CodeforcesProvider implements vscode.TreeDataProvider<Explorer> {
  constructor(private workspaceRoot: string) {
    console.log(workspaceRoot);
  }

  getTreeItem(element: Explorer): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Explorer): Thenable<Explorer[]> {
    console.log(element);
    if(!element) {
      return this.getMasterExplorer();
    }

    else if(element.label === 'Contests') { 
      return this.getContestExplorer();
    }

    else if(element.label === 'Past') { 
      return getPastContests(10);
    }

    else if(element.label === 'Future') { 
      return getFutureContests(20);
    }

    else {
      return Promise.resolve([]);
    }
  }

  getMasterExplorer(): Thenable<Explorer[]> {
    let masterExplorers = [];
    masterExplorers.push(new Explorer("Contests", vscode.TreeItemCollapsibleState.Collapsed));

    return Promise.resolve(
      masterExplorers
    );
  }

  getContestExplorer(): Thenable<Explorer[]> {
    let contestExplorers = [];

    contestExplorers.push(new Explorer("Running", vscode.TreeItemCollapsibleState.Expanded));
    contestExplorers.push(new Explorer("Future", vscode.TreeItemCollapsibleState.Collapsed));
    contestExplorers.push(new Explorer("Past", vscode.TreeItemCollapsibleState.Collapsed));

    return Promise.resolve(
      contestExplorers
    );
  }

}

