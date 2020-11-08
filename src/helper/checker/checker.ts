import * as vscode from "vscode";
import { getCompileCommand } from "../data/data";
import FileHandler from "../fileHandler/fileHandler";
import * as cp from "child_process";

const fs = require("fs");
const { join, basename, sep } = require("path");
const { table } = require("table");

let contestCode = 0;
let problemId = "A";
let problemLabel = "";
let solPath = "";
let problemFolder = "";

export function checker(contestCodeIn: number, problemIdIn: string) {
  contestCode = contestCodeIn;
  problemId = problemIdIn;
  problemLabel = `${contestCode}/${problemId}`;

  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `${problemLabel} Checker`,
    },
    (progress, token): any => {
      console.log("Progress...");
      console.log(progress);
      console.log(token);
      return check(progress);
    }
  );
}

function check(progress: vscode.Progress<any>) {
  return new Promise((resolve) => {
    if (!contestCode || !problemId) {
      vscode.window.showErrorMessage("Wrong Problem for checking");
      resolve(false);
      return;
    }

    const solRegexPath = FileHandler.solPath(contestCode, problemId);

    return FileHandler.findFile(solRegexPath).then((file) => {
      if (file === null) {
        resolve(false);
        vscode.window.showErrorMessage(
          `${problemLabel}: Problem Solution File not found`
        );
        return;
      }

      solPath = file;
      problemFolder = join(solPath, "..");
      console.log("FileFound: " + solPath);

      progress.report({ increment: 10, message: "Compiling..." });

      compileProgram()
        .then((compiled: any) => {
          if (!compiled) {
            resolve(false);
            return;
          }
          progress.report({ increment: 50, message: "Checking Solution..." });
          return getOutput();
        })
        .then((output) => {
          if (!output) {
            resolve(false);
            return;
          }
          progress.report({ increment: 100, message: "Checking Complete." });
          resolve(true);
        });
    });
  });
}

function compileProgram() {
  const compileCommand = getCompileCommand();
  const solFile = basename(solPath);

  const cmd = `${compileCommand} -o compiledSol "${solFile}"`;

  return execShell(cmd,problemFolder)
    .then((stdout) => {
      console.log("Compiled Successfully");
      return true;
    })
    .catch((error: any) => {
      vscode.window
        .showErrorMessage(`${problemLabel}: Compilation Error!!!`, "See Error")
        .then((clicked) => {
          if (clicked === "See Error") {
            const checkerOut = join(problemFolder, "checkerOut.txt");
            FileHandler.createFile(checkerOut, error);
            FileHandler.openFile(checkerOut);
          }
        });
      return false;
    });
}

async function getOutput() {
  try {
    const fileName = join(problemFolder, "sol");
    const inputFolder = join(problemFolder, "input");
    const outputFolder = join(problemFolder, "output");
    const codeOutputFolder = join(problemFolder, "codeOutput");

    if (
      !FileHandler.checkExist(inputFolder) ||
      !FileHandler.checkExist(outputFolder)
    ) {
      handleError("TestCases folder missing");
      return;
    }

    FileHandler.createDir(codeOutputFolder);

    const inputs = FileHandler.readDir(inputFolder);
    const outputs = FileHandler.readDir(outputFolder);

    let testCases: any = [];
    let failedCount = 0;
    let i = 0;

    for (const inputNo of inputs) {
      const outputFile = join(outputFolder, outputs[i]);
      const inputFile = join(inputFolder, inputNo);
      const codeOutputFile = join(codeOutputFolder, `codeOutput${i}.txt`);

      const solFile = `.${sep}compiledSol`;
      const inFile = join(".", basename(inputFolder), basename(inputFile));

      const cmd = await execShell("timeout 2s echo Working").then((stdout)=>{
        console.log(stdout);
        return `timeout 2s  "${solFile}" < "${inFile}"`;
      }).catch((error) => {
        return `"${solFile}" < "${inFile}"`;
      });

      const runCorrectly = await execShell(cmd,problemFolder)
        .then((stdout) => {
          console.log(stdout);

          const modOut = stdout
            .replace(/(\r\n)+/g, "\n")
            .replace(/\r+/g, "\n")
            .trim();

          FileHandler.createFile(codeOutputFile, modOut);

          if (!testOutput(codeOutputFile, outputFile, i)) {
            testCases.push({
              no: i,
              input: inputFile,
              output: outputFile,
              codeOutput: codeOutputFile,
              verdict: false,
            });
            failedCount += 1;
          } else {
            testCases.push({
              no: i,
              input: inputFile,
              output: outputFile,
              codeOutput: codeOutputFile,
              verdict: true,
            });
          }

          return true;
        })
        .catch((error: any) => {
          console.log(error);
          vscode.window
            .showErrorMessage(
              `${problemLabel}: Solution do not run for the input ${i}`,
              "See Error"
            )
            .then((clicked) => {
              if (clicked === "See Error") {
                const checkerOut = join(problemFolder, "checkerOut.txt");
                FileHandler.createFile(checkerOut, error);
                FileHandler.openFile(checkerOut);
              }
            });

          return false;
        });

      if (!runCorrectly) {
        return false;
      }

      i++;
    }

    let message = "All Sample TestCases Passed";

    if (failedCount !== 0) {
      message = "\n" + failedCount + " Sample TestCases failed";
    }

    vscode.window
      .showInformationMessage(`${problemLabel}: ${message}`, "See Result")
      .then((clicked) => {
        if (clicked === "See Result") {
          outputTestCases(testCases);
        }
      });

    return failedCount === 0;
  } catch (err) {
    return false;
  }
}

function testOutput(
  codeOutputFile: string,
  outputFile: string,
  testNo: number
) {
  const codeOutput = FileHandler.readFile(codeOutputFile).toString().trim();
  const output = FileHandler.readFile(outputFile).toString().trim();

  if (codeOutput === output) {
    console.log("TestCase " + testNo + " passed \u2714");
    return 1;
  } else {
    console.log("TestCase " + testNo + " failed \u2718");
    return 0;
  }
}

function outputTestCases(testCases: any) {
  let data = [["No", "Input", "Output", "CodeOutput", "Verdict"]];

  testCases.forEach((testCase: any) => {
    const no = testCase.no;
    const input = fs.readFileSync(testCase.input).toString();
    const output = fs.readFileSync(testCase.output).toString();
    const codeOutput = fs.readFileSync(testCase.codeOutput).toString();
    const verdict = testCase.verdict ? "Passed" : "Failed";

    data.push([no, input, output, codeOutput, verdict]);
  });

  const outputData = table(data);
  const checkerOut = join(problemFolder, "checkerOut.txt");

  FileHandler.createFile(checkerOut, outputData);

  FileHandler.openFile(checkerOut);
}

function execShell(cmd: string, execDir?: any) {
  return new Promise<string>((resolve, reject) => {
    cp.exec(cmd, {cwd: execDir},(err, out) => {
      if (err) {
        return reject(err);
      }
      return resolve(out);
    });
  });
}

function handleError(error: any) {
  console.log("Got an Error. Please try again!!!");
  console.error(error);
}
