import * as vscode from 'vscode';
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("querystring");

const baseUrl = "https://codeforces.com";
const dataFile = path.join(__filename, "..", "..", "..", "res", "Data", "data.json");

const user = {
  handleOrEmail: "testBot",
  password: "testbot@123",
};

let session = {
  csrfToken: "",
  cookie: "",
};

async function login() {
  let data = JSON.parse(readFile(dataFile));

  if (!data || !data.cookie || !data.lastUpdate || Date.now() - data.lastUpdate > 3600000) {
    return getCsrfAndJid()
      .then(() => {
        return requestLogin();
      })
      .then(() => {
        data.cookie = session.cookie;
        data.lastUpdate = Date.now();
        console.log("Time: "+data.lastUpdate);
        createFile(dataFile,JSON.stringify(data));

        return data.cookie;
      });

  }
  else {
    return data.cookie;
  }

}

function getCsrfAndJid() {
  return axios
    .get(baseUrl + "/enter")
    .then((res: any) => {
      session.cookie = res["headers"]["set-cookie"][0].split(";")[0];

      const $ = cheerio.load(res.data);
      session.csrfToken = $("meta[name='X-Csrf-Token']")[0].attribs["content"];

      // console.log(session)
    })
    .catch((err: any) => {
      handleError(err);
    });
}

function requestLogin() {
  console.log("Logging...");

  const url = baseUrl + "/enter";

  const options = {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Cookie: session.cookie,
    },
  };

  const data = {
    ...user,
    csrf_token: session.csrfToken,
    action: "enter",
  };

  return axios
    .post(url, qs.stringify(data), options)
    .then((res: any) => {
      const $ = cheerio.load(res.data);
      const userId = $($(".lang-chooser a")[2]).html();

      session.csrfToken = $("meta[name='X-Csrf-Token']")[0].attribs["content"];

      console.log(`Login Successful. Welcome ${userId}!!!`);
    })
    .catch((err: any) => {
      handleError(err);
    });
}

function readFile(file: string) {
  checkExist(file, fs.existsSync(file));
  return fs.readFileSync(file);
}

function createFile(fileName: string, data: any) {
  fs.writeFile(fileName, data, (err: any) => err ? handleError(err) : null);
}

function checkExist(obj: string, exist: boolean) {
  if (!exist) {
    handleError(obj + " does not Exist");
  }
}

function handleError(error: any) {
  console.log(error);
  console.log("Failed to login!!!!!!!!!!");
  throw new Error("Failed to login!!!!!!!");
}

export default login;
