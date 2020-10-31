import * as vscode from "vscode";
import axios from "../../helper/axios/axios";
import { Explorer } from "../../Container/explorer";

export function getContests(type: string, limit: number, expandable: vscode.TreeItemCollapsibleState): Thenable<Explorer[]> {
  const URL = "/api/contest.list";

  return axios.get(URL).then((res) => {
    const allContests = res.data["result"];

    const typeContests = allContests.filter((contest: any) => {
        // console.log(contest);
        return (type === 'Past' && contest.phase === "FINISHED") || 
        (type === 'Future' && contest.phase === "BEFORE") || 
        (type === 'Running' && contest.phase !== "BEFORE" && contest.phase !== "FINISHED" && contest.id !== 1308 && contest.id !== 1309);

        return false;
    });

    const limitedContests = typeContests
      .sort(
        (contestA: any, contestB: any) => 
          contestB.startTimeSeconds - contestA.startTimeSeconds
      )
      .slice(0, limit);

    // console.log(limitedContests);

    const contestsExplorer = limitedContests.map((contest: any) => {

      const contestDate = new Date(contest.startTimeSeconds * 1000);
      let contestDetail = `${contest.name} : \n${contestDate.toString()}`;

      return new Explorer(
        `${contest.id}_${contest.name}`,
        `${type}Contest`,
        expandable,
        contest.id,
        "Past",
        contestDetail
      );
    });

    return Promise.resolve(contestsExplorer);
  });
}