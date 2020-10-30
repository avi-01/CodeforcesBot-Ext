import * as vscode from "vscode";

let data = {
  handleOrEmail: "",
  password: "",
  lastUpdate: 1603880554122,
  cookie: null,
  compileCommand: "g++-8 -D L --std=c++14",
  templateLineNo: 174,
};

export function updateData(newData: any) {
    data = newData;
}

export function getData() {
    return data;
}

export function getUserHandle() {
    return data.handleOrEmail;
}

export function getUserPassword() {
    return data.password;
}

export function getCookie() {
    return data.cookie;
}

export function resetCookie() {
    data.cookie = null;
}

export function setUser(userHandle: string | undefined, userPassword: string | undefined) {

    console.log('------', userHandle, userPassword);
    data.handleOrEmail = userHandle ? userHandle : '';
    data.password = userPassword ? userPassword : '';
}


export function getCompileCommand() {
    return data.compileCommand;
}


export function setCompileCommand(compileCommand: string) {
    return data.compileCommand = compileCommand;
}


export function getTemplateLineNo() {
    return data.templateLineNo;
}


export function setTemplateLineNo(templateLineNo: number) {
    return data.templateLineNo = templateLineNo;
}