import * as vscode from "vscode";


let loginStatusBarItem: vscode.StatusBarItem;

export function setStatusBarItem(statusBarItem: vscode.StatusBarItem) {
  loginStatusBarItem = statusBarItem;
}


export function updateLoginStatus(login: boolean, userHandle: string): void {
    if(!login) {
      loginStatusBarItem.text = `${userHandle}: $(error) Login Failed`;
      loginStatusBarItem.show();
    }
    else{
      loginStatusBarItem.text = `${userHandle}: $(check) Logged in`;
      loginStatusBarItem.show();
    }
}