import * as vscode from "vscode";

let data = {
  handleOrEmail: "testBot",
  password: "testbot@123",
  lastUpdate: 1603880554122,
  cookie: null,
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

export function setUserHandle(userHandle: string, userPassword: string) {
    data.handleOrEmail = userHandle;
    data.password = userPassword;
}