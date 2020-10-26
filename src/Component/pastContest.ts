import * as vscode from "vscode";
import axios from "axios";
import { Explorer } from "../Container/explorer";

export function getPastContests(limit: number): Thenable<Explorer[]> {
  const URL = "https://codeforces.com/api/contest.list";

  return axios.get(URL).then((res) => {
    const allContests = res.data["result"];

    const allPastContests = allContests.filter((contest: any) => {
      return contest.phase === "FINISHED";
    });

    const limitedPastContests = allPastContests
      .sort(
        (contestA: any, contestB: any) => 
          contestB.startTimeSeconds - contestA.startTimeSeconds
      )
      .slice(0, limit);

    console.log(limitedPastContests);

    const pastContestsExplorer = limitedPastContests.map((contest: any) => {
      return new Explorer(
        contest.name,
        vscode.TreeItemCollapsibleState.Collapsed,
        contest.id
      );
    });

    return Promise.resolve(pastContestsExplorer);
  });
}
