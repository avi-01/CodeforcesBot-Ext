// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { ContestsProvider } from "./Component/Contests/contests";
import { Explorer } from "./Container/explorer";
import {setStatusBarItem} from "./Component/LoginStatus/loginStatus";
import { resetCookie, setUser } from "./helper/data/data";
import { createContestFolders } from "./helper/createContestFolder/createContestFolder";


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "codeforcesbot-ext" is now active!');


  setUser(context.globalState.get('userHandle'), context.globalState.get('password'));

  const loginStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
  setStatusBarItem(loginStatusBarItem);

  const contestProvider = new ContestsProvider(
    vscode.workspace.rootPath ? vscode.workspace.rootPath : "/"
  );

  vscode.window.registerTreeDataProvider("contests", contestProvider);

  vscode.commands.registerCommand("contests.refresh", (node: Explorer) => {
	  console.log("REFRESH.....");
    console.log(node);
    contestProvider.refresh();
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "codeforcesbot-ext.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from Codeforces Bot!");
    }
  );

  disposable = vscode.commands.registerCommand("contest.createContestFolders", (node: Explorer) => {
      console.log("Explorer.....");
      console.log(node);
      vscode.window.showInformationMessage("Click create contest folder");
      if(node.explorerId) {
        createContestFolders(node.explorerId, node.label);
      }
    }
  );

  let loginCommand = vscode.commands.registerCommand("codeforcesbot-ext.login", async () => {
      const userHandle = await vscode.window.showInputBox({
        placeHolder: 'Enter user',
        prompt:'Enter user name of Codeforces account',
        validateInput:userHandle => {
          return userHandle !== null && userHandle !== undefined && userHandle !== '' ? null : 'User name can not be empty';
        }
      });
      const password = await vscode.window.showInputBox({
        placeHolder: 'Enter password',
        prompt: 'Enter password of Codeforces account',
      });

      console.log(userHandle, password);

      context.globalState.update('userHandle', userHandle);
      context.globalState.update('password', password); 

      setUser(userHandle, password);
      resetCookie();
      contestProvider.refresh();
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(loginCommand);
}



// this method is called when your extension is deactivated
export function deactivate() {}
