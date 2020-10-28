import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
const cheerio = require("cheerio");
const path = require("path");


import { Explorer } from "../../../Container/explorer";

function getStandings(contestId: number): Thenable<Explorer[]> {
  const url = "/contest/" + contestId;

  return axios.get(url).then((res: any) => {
    const $ = cheerio.load(res.data);

    const problems = $(".problems tr");

    let problemsData: any = {};

    problems.each((idx: number, problem: any) => {
      if (idx === 0) {
        return null;
      }

      const problemData = getProblemData($, problem);

      problemsData[problemData.id] = problemData;
    });

    const acceptedProblems = $(".accepted-problem");
    acceptedProblems.each((idx: number, problem: any) => {
      const id = $(problem).find(".id > a").text().trim();

      console.log("Accepted Problems: " + id);
      problemsData[id].accepted = true;
    });

    console.log(problemsData);

    return Object.keys(problemsData).map((id: any) => {
      const problem = problemsData[id];

      let lightIconPath = null;
      let darkIconPath = null;

      "../../../../res/img/light/ac.svg"

      if(problem.accepted) {
        lightIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "light", "ac.svg");
        darkIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "dark", "ac.svg");

        console.log(lightIconPath);
      }
      
      return new Explorer(
        `${problem.id}: ${problem.name}`,
        "Problem",
        vscode.TreeItemCollapsibleState.None,
        contestId,
        "Problem",
        problem.name,
        problem,
        lightIconPath,
        darkIconPath
      );
    });
  });
}

function getProblemData($: any, problem: any) {
  const id = $(problem).find(".id > a").text().trim();
  const name = $($(problem).find("td")["1"])
    .find("div > div > a")
    .text()
    .trim();
  const numberOfSolves = $(
    $(problem).find("a[title='Participants solved the problem']")
  )
    .text()
    .replace("x", "")
    .trim();

  const accepted = false;

  const problemData = { id, name, numberOfSolves, accepted };

  return problemData;
}

export default getProblems;
