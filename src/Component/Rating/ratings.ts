import axios from "../../helper/axios/axios";
import * as vscode from "vscode";

import { Explorer } from "../../Container/explorer";
import { getUserHandle } from "../../helper/data/data";
import getFriends from "../../helper/friends/friends";

export class RatingsProvider implements vscode.TreeDataProvider<Explorer> {
  private rootPath;

  constructor(private workspaceRoot: string) {
    console.log(workspaceRoot);
    this.rootPath = workspaceRoot;
  }

  getTreeItem(element: Explorer): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Explorer): Thenable<Explorer[]> {
    console.log(element);
    return this.getRatings();
  }

  async getRatings() {

    const userFriends = await getFriends();
    let ratingUrl = "api/user.info?handles=" + getUserHandle();

    userFriends.forEach((friend: any) => {
      ratingUrl += ";" + friend;
    });

    return axios.get(ratingUrl).then((res: any) => {

        const users = res.data.result;

        users.sort((userA: any, userB: any)=> {
            return userB.rating - userA.rating;
        });

        return users.map((user: any, i:number) =>{

            let name = user.firstName + " " + user.lastName;
            if(!user.firstName) {
                name = "";
            }

            const userDetail = {
                rating: user.rating,
                handle: user.handle,
                name: name
            };

            return this.getRatingExplorer(userDetail,i+1);
        });
    });
  }

  getRatingExplorer(userDetail: any, rank: number): Explorer {
    let label = `${rank}. ${userDetail.rating}: ${userDetail.handle} (${userDetail.name})`;

    if(userDetail.handle === getUserHandle()) {
        label = `---> ${rank}. ${userDetail.rating}: ${userDetail.handle} (${userDetail.name})`;
    }

    const problemExplorer = new Explorer(
      label,
      "Rating",
      vscode.TreeItemCollapsibleState.None,
    );

    return problemExplorer;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Explorer | undefined> = new vscode.EventEmitter<Explorer | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Explorer | undefined> = this._onDidChangeTreeData.event;

  public refresh(): void {
    console.log("Event");
    console.log(this.onDidChangeTreeData);
    this._onDidChangeTreeData.fire(undefined);
  }
}
