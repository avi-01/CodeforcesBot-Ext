import * as vscode from "vscode";
import axios from "../../../axios/axios";
import { Explorer } from "../../../Container/explorer";

export function getRunningContests(limit: number): Thenable<Explorer[]> {
  const URL = "https://codeforces.com/api/contest.list";

  return axios.get(URL).then((res) => {
    const allContests = res.data["result"];

    const allRunningContests = allContests.filter((contest: any) => {
      return contest.phase !== "BEFORE" && contest.phase !== "FINISHED" && contest.id !== 1308 && contest.id !== 1309;
    });

    const limitedRunningContests = allRunningContests
      .sort(
        (contestA: any, contestB: any) => 
        contestA.startTimeSeconds - contestB.startTimeSeconds
      )
      .slice(0, limit);

    console.log(limitedRunningContests);

    const runningContestsExplorer = limitedRunningContests.map((contest: any) => {
      return new Explorer(
        contest.name,
        vscode.TreeItemCollapsibleState.Collapsed,
        contest.id,
        "Running",
      );
    });

    return Promise.resolve(runningContestsExplorer);
  });
}
