import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
import { Explorer } from "../../../Container/explorer";

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

      const contestDate = new Date(contest.startTimeSeconds * 1000);
      let contestDetail = `${contest.name} : \n${contestDate.toString()}`;

      return new Explorer(
        contest.name,
        "PastContest",
        vscode.TreeItemCollapsibleState.Collapsed,
        contest.id,
        "Past",
        contestDetail
      );
    });

    return Promise.resolve(pastContestsExplorer);
  });
}
