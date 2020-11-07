const fs = require("fs");
const {join, sep} = require("path");
import * as vscode from "vscode";


class FileHandler {
  
  static openFile(path: string, options?: any) {
    return vscode.window.showTextDocument(vscode.Uri.file(path), options);
  }

  static findFile(path: string) {
    return vscode.workspace.findFiles(path).then((files) => {
      if(files.length === 0) {
        return null;
      }  
      else {
        return files[0].fsPath;
      }
    });
  }

  static getProblemDetail(path: string) {
    const paths = path.split(sep);
    const size = paths.length;
    const regexPath = "^.*Codeforces,.*_.*,.*_.*,.*_.*\.cpp$";
    if(!paths.join(",").match(regexPath)) {
      return null;
    }
    const id = paths[size - 1].split("_")[0];
    const contestId = Number(paths[size - 3].split("_")[0]);

    const isNotNumber = isNaN(contestId);

    if(contestId && id && !isNotNumber) {
      return {contestId:contestId, id: id};
    }

    return null;

  }

  static solPath(contestId: number, problemId: string): string {
    return join("Codeforces",`${contestId}*`,`${problemId}*`,`${problemId}*.cpp`);
  }

  static readFile(path: string, encoding: string | null = "ascii") {
    if(!this.checkExist(path)) {
      return null;
    }
    return fs.readFileSync(path, {encoding: encoding});
  }

  static readDir(path: string) {
    if(!this.checkExist(path)) {
      return null;
    }
    return fs.readdirSync(path);
  }

  static createDir(path: string, recursive: boolean = true) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {recursive: recursive});
    }
  }

  static createFile(fileName: string, data: any) {
    fs.writeFileSync(fileName, data, (err: any) => (err ? this.handleError(err) : null));
  }

  static copyFile(fromCopy: string, toCopy:string) {
    fs.copyFileSync(fromCopy, toCopy, (err:any) => this.handleError(err));
  }

  static checkExist(path: string): boolean {
    if (!fs.existsSync(path)) {
      return false;
    }

    return true;
  }
  
  static handleError(error: any) {
    console.log(error);
    throw new Error("Failure!!!!!");
  }
  
}


export default FileHandler;