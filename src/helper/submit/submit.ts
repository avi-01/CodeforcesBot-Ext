import { window, ProgressLocation } from "vscode";

import FileHandler from "../fileHandler/fileHandler";
import axios from "../axios/axios";
import { checker } from "../checker/checker";
import { getCsrfToken, getSubmitCompiler, getUserHandle } from "../data/data";
import { AxiosResponse, AxiosRequestConfig } from "axios";
import login from "../Login/login";

const cheerio = require("cheerio");
const formData = require("form-data");

let contestId = 0;
let problemId = "";
let problemLabel = "";
let solFile: string;

export async function submitSolution(contestIdIn: number, problemIdIn: string) {
  contestId = contestIdIn;
  problemId = problemIdIn;
  problemLabel = `${contestId}/${problemId}`;

  if (!contestId || !problemId) {
    window.showErrorMessage("Contest or Problem not found");
    return;
  }

  const solRegexPath = FileHandler.solPath(contestId, problemId);

  const isSolFile = await FileHandler.findFile(solRegexPath);

  if (isSolFile === null) {
    window.showErrorMessage(`${problemLabel}: Problem Solution File not found`);
    return;
  }

  solFile = isSolFile;

  return window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${problemLabel} Submit`,
      cancellable: true,
    },
    async (progress, token): Promise<any> => {
      console.log("Progress...");
      console.log(progress);
      console.log(token);

      token.onCancellationRequested(() => {
        console.log("User cancelled the submission");
        return;
      });

      progress.report({
        message: "Checking sample testcases...",
        increment: 10,
      });
      const checkerResult = await checker(contestId, problemId);

      progress.report({ message: "Sample testcases checked", increment: 20 });

      let userSelection;

      if (!checkerResult) {
        userSelection = await window.showErrorMessage(
          problemLabel +
            ": Solution failed in sample test cases. Do you want to submit any way?",
          "Submit",
          "Cancel"
        );
      } else {
        userSelection = await window.showInformationMessage(
          problemLabel +
            ": Solution passed in sample test cases. Confirm to submit.",
          "Submit",
          "Cancel"
        );
      }

      if (userSelection !== "Submit") {
        return;
      }

      progress.report({ message: "Submitting the solution...", increment: 20 });
      const submissionId = await submit();

      console.log("submitResult:"+ submissionId);

      if(!submissionId) {
        return;
      }

      progress.report({ message: "TESTING...", increment: 30 });
      const verdict = await checkVerdict(parseInt(submissionId));

      console.log("verdict:"+ verdict);
      return; 
    }
  );
}

async function submit() {
  const submitUrl = `/contest/${contestId}/submit`;

  const sol = FileHandler.readFile(solFile);

  if(!getCsrfToken()) {
    const logged = await login();
    if(!logged) {
      window.showErrorMessage(
        problemLabel + ": User not logged in."
      );
      return;
    }
  } 

  const form = new formData();
  form.append("action", "submitSolutionFormSubmitted");
  form.append("csrf_token", getCsrfToken());
  form.append("programTypeId", getSubmitCompiler());
  form.append("source", sol);
  form.append("submittedProblemIndex", problemId);

  const options: AxiosRequestConfig = {
    method: "POST",
    url: submitUrl,
    headers: {
      ...form.getHeaders(),
    },
    data: form,
  };

  return axios(options)
    .then((res: AxiosResponse) => {
      const $ = cheerio.load(res.data);

      const sameSourceDiv = $(".error.for__source");

      if (sameSourceDiv.length > 0) {
        window.showErrorMessage(
          problemLabel + ": You have submitted exactly the same code before"
        );
        return null;
      }

      const submissionId = $("a.view-source").attr("submissionid");

      console.log(submissionId);

      return submissionId;

    })
    .catch((res: any) => {
      console.error(res);
      return null;
    });
}


async function checkVerdict(submissionId: number) {
    const URL = `/api/user.status?handle=${getUserHandle()}&from=1&count=40`; 

    let verdict = "TESTING";

    while(verdict === "TESTING") {
      await wait(2000);
      const res = await axios.get(URL);
      const submissions = res.data.result;

      const submission = submissions.find((submission: any) => {
        return submission.id === submissionId;
      });

      verdict = submission.verdict;
    }

    if(verdict === "OK") {
      window.showInformationMessage( problemLabel + ": Solution Passed");
    }
    else {
      window.showErrorMessage( problemLabel + ": Solution Failed:- " + verdict);
    }

    return verdict;
}

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}