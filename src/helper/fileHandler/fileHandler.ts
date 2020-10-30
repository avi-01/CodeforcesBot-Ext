const fs = require("fs");
class FileHandler {
  static readFile(path: string, encoding: string | null = "ascii") {
    if(!this.checkExist(path)) {
      return null;
    }
    return fs.readFileSync(path, {encoding: encoding});
  }

  static createDir(path: string, recursive: boolean = true) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {recursive: recursive});
    }
  }

  static createFile(fileName: string, data: any) {
    fs.writeFile(fileName, data, (err: any) => (err ? this.handleError(err) : null));
  }

  static copyFile(fromCopy: string, toCopy:string) {
    fs.copyFile(fromCopy, toCopy, (err:any) => this.handleError(err));
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