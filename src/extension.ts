// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { ContestsProvider } from "./Component/Contests/contests";
import { RatingsProvider } from "./Component/Rating/ratings";
import { Explorer } from "./Container/explorer";
import { setStatusBarItem } from "./Component/LoginStatus/loginStatus";
import { resetCookie, setConfiguration, setUser } from "./helper/data/data";
import { createContestFolders } from "./helper/createContestFolder/createContestFolder";
import { checker } from "./helper/checker/checker";
import FileHandler from "./helper/fileHandler/fileHandler";
import Problem from "./Component/Contests/Problems/problem";
import { submitSolution } from "./helper/submit/submit";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "codeforcesbot-ext" is now active!'
  );

  //set user name and password from vs code global state
  setUser(
    context.globalState.get("userHandle"),
    context.globalState.get("password")
  );

  setInterval(() => {
    vscode.commands.executeCommand("contests.refresh");
  },120000);

  //status bar login status
  const loginStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1
  );
  setStatusBarItem(loginStatusBarItem);

  //TreeProvider
  const contestsProvider = new ContestsProvider(
    vscode.workspace.rootPath ? vscode.workspace.rootPath : "/"
  );
  const ratingsProvider = new RatingsProvider(
    vscode.workspace.rootPath ? vscode.workspace.rootPath : "/"
  );
  
  vscode.window.registerTreeDataProvider("contests", contestsProvider);
  vscode.window.registerTreeDataProvider("ratings", ratingsProvider);

  //set Configuration
  updateConfiguration();
  //update Configuration
  vscode.workspace.onDidChangeConfiguration(() => {
    updateConfiguration();
  });

  //refresh view
  const contestsRefreshCommand = vscode.commands.registerCommand(
    "contests.refresh",
    (node: Explorer) => {
      console.log("REFRESH.....");
      console.log(node);
      contestsProvider.refresh();
    }
  );
  
  const ratingsRefreshCommand = vscode.commands.registerCommand(
    "ratings.refresh",
    (node: Explorer) => {
      console.log("REFRESH.....");
      console.log(node);
      ratingsProvider.refresh();
    }
  );

  //open solution file
  const openSolCommand = vscode.commands.registerCommand(
    "contest.openSol",
    (node: Problem) => {
      console.log("Opening File.....");
      const solRegexPath = FileHandler.solPath(node.contestId, node.id);
      FileHandler.findFile(solRegexPath).then((file) => {
        if (file === null) {
          vscode.window.showErrorMessage(
            "File not found!!! Run create contest folder"
          );
          return;
        }

        FileHandler.openFile(file, { preview: false });
      });
    }
  );

  //create contest folder
  const createContestFoldersCommand = vscode.commands.registerCommand(
    "contest.createContestFolders",
    (node: Explorer) => {
      console.log("Explorer.....");
      console.log(node);
      vscode.window.showInformationMessage("Creating contest folder...");
      if (node && node.explorerId) {
        createContestFolders(node.explorerId, node.label);
      }
    }
  );

  // check solution of sample testcases
  const checkerSolCommand = vscode.commands.registerCommand(
    "contest.checkerSol",
    async (node: any) => {
      console.log("Checker.....");
      const detail = getContestId(node);
      if (!detail) {
        vscode.window.showErrorMessage(
          node.fsPath + ": \nFile does not belong to codeforces contest"
        );
        return;
      }

      const checkerResult = await checker(detail.contestId, detail.problemId);
      console.log("CheckerResult:- ", checkerResult);
    }
  );

  // check solution of sample testcases
  const submitSolCommand = vscode.commands.registerCommand(
    "contest.submitSol",
    async (node: any) => {
      console.log("Submit.....");
      const detail = getContestId(node);
      if (!detail) {
        vscode.window.showErrorMessage(
          node.fsPath + ": \nFile does not belong to codeforces contest"
        );
        return;
      }

      await submitSolution(detail.contestId, detail.problemId);
      contestsProvider.refresh();
    }
  );

  //update user and password
  const loginCommand = vscode.commands.registerCommand(
    "codeforcesbot-ext.login",
    async () => {
      const userHandle = await vscode.window.showInputBox({
        placeHolder: "Enter user",
        prompt: "Enter user name of Codeforces account",
        validateInput: (userHandle) => {
          return userHandle !== null &&
            userHandle !== undefined &&
            userHandle !== ""
            ? null
            : "User name can not be empty";
        },
      });
      const password = await vscode.window.showInputBox({
        placeHolder: "Enter password",
        prompt: "Enter password of Codeforces account",
      });

      console.log(userHandle, password);

      context.globalState.update("userHandle", userHandle);
      context.globalState.update("password", password);

      setUser(userHandle, password);
      resetCookie();
      contestsProvider.refresh();
    }
  );

  context.subscriptions.push(contestsRefreshCommand);
  context.subscriptions.push(ratingsRefreshCommand);
  context.subscriptions.push(openSolCommand);
  context.subscriptions.push(createContestFoldersCommand);
  context.subscriptions.push(checkerSolCommand);
  context.subscriptions.push(submitSolCommand);
  context.subscriptions.push(loginCommand);
}

function updateConfiguration() {
  const configuration = vscode.workspace.getConfiguration("codeforcesBot");
  console.log("Configuration: ");
  const compileCommand = configuration.compile.command;
  const templateFile = configuration.template.templateFile;
  const templateLineNo = configuration.template.templateLineNumber;
  setConfiguration(compileCommand, templateFile, templateLineNo);
}

function getContestId(node: any) {
  if (node && node.data && node.data.contestId && node.data.id) {
    return { contestId: node.data.contestId, problemId: node.data.id };
  } else {
    const problemDetail = FileHandler.getProblemDetail(node.fsPath);
    if (problemDetail && problemDetail.contestId && problemDetail.id) {
      return {
        contestId: problemDetail.contestId,
        problemId: problemDetail.id,
      };
    }
  }

  return null;
}

// this method is called when your extension is deactivated
export function deactivate() {}
