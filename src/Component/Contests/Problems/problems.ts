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

        //console.log(problemsArrList);

        let promiseArr: Promise<any>[] = [];

        problemsArrList.forEach((problemObject: any) => {
          const problemIndex = problemObject.index;
          const problemName = problemObject.name;
          //console.log("INDEX: " + problemObject.index);

          const problem: Problem = this.getProblemData(problemIndex,problemName, data);
          this.problemsArr.push(problem);
        });
      })
      .catch((err) => {
        console.error(err);
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


export default Problems;
