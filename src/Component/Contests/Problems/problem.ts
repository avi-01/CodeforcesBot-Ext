import { AxiosResponse } from "axios";
import * as vscode from "vscode";
import { Explorer } from "../../../Container/explorer";
import axios from "../../../helper/axios/axios";
const path = require("path");

const resPath = path.join(__filename, "..", "..", "..", "..", "..", "res");

class Problem {
  userHandle;
  contestId;
  id;
  name = "";
  points = 0;
  rejectedAttemptCount = 0;
  bestSubmissionTime = 0;
  practiceAc = false;
  practiceRejects = 0;

  constructor(userHandle: string, contestId: number, id: string) {
    this.userHandle = userHandle;
    this.contestId = contestId;
    this.id = id;
  }

  fetchProblemData() {
    const problemApiUrl = `/api/contest.standings?contestId=${this.contestId}&handles=${this.userHandle}&showUnofficial=true`;
    return axios.get(problemApiUrl).then((res: AxiosResponse) => {
      const data = res.data.result;

      this.name = data.problems.filter((problem: any) => {
        return problem.index === this.id;
      })[0].name;

      const problemIndex = this.id.charCodeAt(0) - "A".charCodeAt(0);

      data.rows.forEach((row: any) => {

        if (row.party.participantType === "CONTESTANT") {

          const problemObject = row.problemResults[problemIndex];
          this.rejectedAttemptCount = problemObject.rejectedAttemptCount;
          this.bestSubmissionTime = problemObject.bestSubmissionTimeSeconds;
          this.points = problemObject.points;

        } else if (row.party.participantType === "PRACTICE") {

          const problemPractObject = row.problemResults[problemIndex];
          this.practiceAc = problemPractObject.points !== 0;
          this.practiceRejects = problemPractObject.rejectedAttemptCount;

        }

      });
    });
  }

  setProblemData(
    name: string,
    points: number,
    rejectedAttemptCount: number,
    bestSubmissionTime: number
  ) {
    this.name = name;
    this.points = points;
    this.rejectedAttemptCount = rejectedAttemptCount;
    this.bestSubmissionTime = bestSubmissionTime;
  }

  toExplorer(): Explorer {
    let lightIconPath = null;
    let darkIconPath = null;

    let label = `${this.id}_${this.name}`;

    if (this.points !== 0 || this.practiceAc) {
      lightIconPath = path.join(resPath, "img", "light", "ac.svg");
      darkIconPath = path.join(resPath, "img", "dark", "ac.svg");

      if (this.points !== 0) {
        const waCount =
          this.rejectedAttemptCount === 0 ? " " : this.rejectedAttemptCount;
        label = `${this.id}_${this.name} | +${waCount}`;
      }
    } else if (this.rejectedAttemptCount !== 0 || this.practiceRejects !== 0) {
      lightIconPath = path.join(resPath, "img", "light", "wa.svg");
      darkIconPath = path.join(resPath, "img", "dark", "wa.svg");

      if (this.rejectedAttemptCount !== 0) {
        label = `${this.id}_${this.name} | -${this.rejectedAttemptCount}`;
      }
    }

    // console.log(this.id,this.name,label);

    const problemExplorer = new Explorer(
      label,
      "Problem",
      vscode.TreeItemCollapsibleState.None,
      this.contestId,
      "Problem",
      this.name,
      this,
      lightIconPath,
      darkIconPath,
      {
        command: 'contest.openSol',
        title: '',
        arguments: [this]
      }
    );


    return problemExplorer;
  }
}

export default Problem;
