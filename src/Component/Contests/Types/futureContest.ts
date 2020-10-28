import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
import { Explorer } from "../../../Container/explorer";

export function getFutureContests(limit: number): Thenable<Explorer[]> {
  const URL = "https://codeforces.com/api/contest.list";

  return axios.get(URL).then((res) => {
    const allContests = res.data["result"];

    const allFutureContests = allContests.filter((contest: any) => {
      return contest.phase === "BEFORE";
    });

    const limitedFutureContests = allFutureContests
      .sort(
        (contestA: any, contestB: any) => 
        contestA.startTimeSeconds - contestB.startTimeSeconds
      )
      .slice(0, limit);

    console.log(limitedFutureContests);

    const futureContestsExplorer = limitedFutureContests.map((contest: any) => {

      const contestDate = new Date(contest.startTimeSeconds * 1000);
      let contestDetail = `${contest.name} : \n${contestDate.toString()}`;
      return new Explorer(
        contest.name,
        "FutureContest",
        vscode.TreeItemCollapsibleState.None,
        contest.id,
        "Future",
        contestDetail
        
      );
    });

    return Promise.resolve(futureContestsExplorer);
  });
}
