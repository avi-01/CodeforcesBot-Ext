import * as vscode from "vscode";
import axios from "../../../axios/axios";
const cheerio = require("cheerio");

import { Explorer } from "../../../Container/explorer";

function getProblems(contestId: number | undefined): Thenable<Explorer[]> {
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
      return new Explorer(
        `${problem.id}: ${problem.name}`,
        vscode.TreeItemCollapsibleState.None,
        contestId,
        "Problem",
        problem.name,
        problem
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
