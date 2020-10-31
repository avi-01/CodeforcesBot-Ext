import * as vscode from "vscode";
import { getCompileCommand } from "../data/data";
import FileHandler from "../fileHandler/fileHandler";
import * as cp from 'child_process';
import { Console } from "console";

const fs = require("fs");
const { join } = require("path");
const {table} = require('table');

let contestCode = 0;
let problemId = 'A';
let solPath = "";
let problemFolder = "";


export function checker(contestCodeIn: number, problemIdIn: string) {
    contestCode = contestCodeIn;
    problemId = problemIdIn;

    if(!contestCode || !problemId) {
        vscode.window.showErrorMessage("Wrong Problem for checking");
        return 0;
    }

    const solRegexPath = join("Codeforces",`${contestCode}*`,`${problemId}*`,`${problemId}*.cpp`);

    return vscode.workspace.findFiles(solRegexPath)
    .then((files) => {
        if(files.length === 0) {
            vscode.window.showErrorMessage("Problem Solution File not found");
            return false;
        }  
    
        vscode.window.showInformationMessage("Checking Solution...");
    
        solPath = files[0].path;
        problemFolder = join(solPath, "..");
        console.log("FileFound: "+solPath);
    
        return compileProgram();
    })
    .then((compiled) => {
        if(!compiled) {
            return false;
        }
        return getOutput();
    });
    
}



function compileProgram() {
  const compileCommand = getCompileCommand();
  const fileName = solPath;
  const fileSave = join(problemFolder, "sol");

  const cmd = `${compileCommand} -o "${fileSave}" "${fileName}"`;

  return execShell(cmd).then((stdout) => {
    console.log("Compiled Successfully");
    return true;
  }).catch((error: any) => {

    vscode.window.showInformationMessage(`Compilation Error!!!`, "See Error").then((clicked) => {
        if(clicked === "See Error") {
            const checkerOut = join(problemFolder,"checkerOut.txt");
            FileHandler.createFile(checkerOut, error);
            vscode.window.showTextDocument(vscode.Uri.file(checkerOut), { preview: true });
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

    if(!FileHandler.checkExist(inputFolder) || !FileHandler.checkExist(outputFolder)) {
        handleError("TestCases folder missing");
        return;
    }

    FileHandler.createDir(codeOutputFolder);

    const inputs = FileHandler.readDir(inputFolder);
    const outputs = FileHandler.readDir(outputFolder);

    let testCases: any = [];
    let failedCount = 0;
    let i = 0;

    for(const inputNo of inputs) {
      const outputFile = join(outputFolder, outputs[i]);
      const inputFile = join(inputFolder, inputNo);
      const codeOutputFile = join(codeOutputFolder, `codeOutput${i}.txt`);

      
      const cmd = `"${fileName}" < "${inputFile}"`;

      await execShell(cmd).then( (stdout)=> {

        console.log(stdout);

        const modOut = stdout.replace( /(\r\n)+/g, "\n" ).replace( /\r+/g, "\n" ).trim();
        
        FileHandler.createFile(codeOutputFile, modOut);

        if (!testOutput(codeOutputFile, outputFile, i)) {
            testCases.push({
            no: i,
            input: inputFile,
            output: outputFile,
            codeOutput: codeOutputFile,
            verdict: false
            });
            failedCount += 1;
        }
        else {
            testCases.push({
                no: i,
                input: inputFile,
                output: outputFile,
                codeOutput: codeOutputFile,
                verdict: true
            });
        }

        return;

      }).catch((error: any) => {
          console.log(error);
        handleError("Solution doest not run for the input" + i);
      });
        
      i++;
    };

    let message = "All Sample TestCases Passed";

    if (failedCount !== 0) {
      message = "\n" + failedCount + " Sample TestCases failed";
    }

    vscode.window.showInformationMessage(message,"See Result").then((clicked) => {
        if(clicked === "See Result") {
            outputTestCases(testCases);
        }
    });

    return failedCount === 0;


  } catch (err) {
      return false;
  }
}

function testOutput(codeOutputFile: string, outputFile: string, testNo: number) {
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

    data.push([no,input, output, codeOutput, verdict]);
  });

  const outputData = table(data);
  const checkerOut = join(problemFolder,"checkerOut.txt");

  FileHandler.createFile(checkerOut, outputData);

  vscode.window.showTextDocument(vscode.Uri.file(checkerOut), { preview: true });
}

function execShell(cmd: string) {
    return new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
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
