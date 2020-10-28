import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
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

      const contestDate = new Date(contest.startTimeSeconds * 1000);
      let contestDetail = `${contest.name} : \n${contestDate.toString()}`;

      return new Explorer(
        contest.name,
        "RunningContest",
        vscode.TreeItemCollapsibleState.Collapsed,
        contest.id,
        "Running",
        contestDetail
      );
    });

    return Promise.resolve(runningContestsExplorer);
  });
}
