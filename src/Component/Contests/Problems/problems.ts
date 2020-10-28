import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
const cheerio = require("cheerio");
const path = require("path");

import { Explorer } from "../../../Container/explorer";
import { AxiosResponse } from "axios";
import Problem from "./problem";

class Problems {
  userHandle;
  contestId;
  problemsArr: Problem[] = [];

  constructor(userHandle: string, contestId: number, problemsArr?: any) {
    this.userHandle = userHandle;
    this.contestId = contestId;
    if (problemsArr) {
      this.problemsArr = problemsArr;
    }
  }

  fetchProblems() {
    const contestApiUrl = `/api/contest.standings?contestId=${this.contestId}&handles=${this.userHandle}&showUnofficial=true`;
    return axios
      .get(contestApiUrl)
      .then((res: AxiosResponse) => {
        const data = res.data.result;

        const problemsArrList = data.problems;

        console.log(problemsArrList);

        let promiseArr: Promise<any>[] = [];

        problemsArrList.forEach((problemObject: any) => {
          const problemIndex = problemObject.index;
          const problemName = problemObject.name;
          console.log("INDEX: " + problemObject.index);

          const problem: Problem = this.getProblemData(problemIndex,problemName, data);
          this.problemsArr.push(problem);
        });
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  }

  getProblemData(index: string,name: string, data: any): Problem {

    const problemIndex = index.charCodeAt(0) - "A".charCodeAt(0);

    const problem = new Problem(this.userHandle,this.contestId,index);
    problem.name = name;

    data.rows.forEach((row: any) => {
      if (row.party.participantType === "CONTESTANT") {
        
        const problemObject = row.problemResults[problemIndex];
        problem.rejectedAttemptCount = problemObject.rejectedAttemptCount;
        problem.bestSubmissionTime = problemObject.bestSubmissionTimeSeconds;
        problem.points = problemObject.points;

      } else if (row.party.participantType === "PRACTICE") {

        const problemPractObject = row.problemResults[problemIndex];
        problem.practiceAc = problemPractObject.points !== 0;
        problem.practiceRejects = problemPractObject.rejectedAttemptCount;
        
      }
    });

    return problem;
  }

  toExplorer(): Explorer[] {
    return this.problemsArr.map((problem: Problem) => {
      return problem.toExplorer();
    });
  }
}

// function getProblems(contestId: number): Thenable<Explorer[]> {
//   const url = "/contest/" + contestId;

//   return axios.get(url).then((res: any) => {
//     const $ = cheerio.load(res.data);

//     const problemsArr = $(".problemsArr tr");

//     let problemsArrData: any = {};

//     problemsArr.each((idx: number, problem: any) => {
//       if (idx === 0) {
//         return null;
//       }

//       const problemData = getProblemData($, problem);

//       problemsArrData[problemData.id] = problemData;
//     });

//     const acceptedProblems = $(".accepted-problem");
//     acceptedProblems.each((idx: number, problem: any) => {
//       const id = $(problem).find(".id > a").text().trim();

//       console.log("Accepted Problems: " + id);
//       problemsArrData[id].accepted = true;
//     });

//     console.log(problemsArrData);

//     return Object.keys(problemsArrData).map((id: any) => {
//       const problem = problemsArrData[id];

//       let lightIconPath = null;
//       let darkIconPath = null;

//       if(problem.accepted) {
//         lightIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "light", "ac.svg");
//         darkIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "dark", "ac.svg");

//         console.log(lightIconPath);
//       }

//       return new Explorer(
//         `${problem.id}: ${problem.name}`,
//         "Problem",
//         vscode.TreeItemCollapsibleState.None,
//         contestId,
//         "Problem",
//         problem.name,
//         problem,
//         lightIconPath,
//         darkIconPath
//       );
//     });
//   });
// }

// function getProblemData($: any, problem: any) {
//   const id = $(problem).find(".id > a").text().trim();
//   const name = $($(problem).find("td")["1"])
//     .find("div > div > a")
//     .text()
//     .trim();
//   const numberOfSolves = $(
//     $(problem).find("a[title='Participants solved the problem']")
//   )
//     .text()
//     .replace("x", "")
//     .trim();

//   const accepted = false;

//   const problemData = { id, name, numberOfSolves, accepted };

//   return problemData;
// }

// export default getProblems;

export default Problems;
