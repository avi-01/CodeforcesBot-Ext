const fs = require("fs");

class FileHandler {
  static readFile(file: string) {
    this.checkExist(file, fs.existsSync(file));
    return fs.readFileSync(file);
  }

  static createFile(fileName: string, data: any) {
    fs.writeFile(fileName, data, (err: any) => (err ? this.handleError(err) : null));
  }

  static checkExist(obj: string, exist: boolean) {
    if (!exist) {
      this.handleError(obj + " does not Exist");
    }
  }
  
  static handleError(error: any) {
    console.log(error);
    throw new Error("Failure!!!!!");
  }
  
}


export default FileHandler;