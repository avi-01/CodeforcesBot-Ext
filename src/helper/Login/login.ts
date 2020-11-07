import * as vscode from 'vscode';
import { updateLoginStatus } from '../../Component/LoginStatus/loginStatus';
import { getData, getUserHandle, updateData, getUserPassword} from '../data/data';

const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("querystring");

const baseUrl = "https://codeforces.com";


let session = {
  csrfToken: "",
  cookie: "",
};

async function login() {
  let data: any = getData();


  const userHandle = getUserHandle();

  if(userHandle === null || userHandle === undefined || userHandle === '') {
    handleError("Failed to login user: "+userHandle);
    return '';
  }

  if (!data || !data.cookie || data.cookie === '' || !data.lastUpdate || Date.now() - data.lastUpdate > 3600000) {
    return getCsrfAndJid()
      .then(() => {
        return requestLogin();
      })
      .then(() => {
        data.cookie = session.cookie;
        data.csrfToken = session.csrfToken;
        data.lastUpdate = Date.now();
        console.log("Time: "+data.lastUpdate);
        updateData(data);

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

      console.log(session);
    })
    .catch((err: any) => {
      handleError(err);
    });
}

function requestLogin() {
  console.log("Logging...");

  const url = baseUrl + "/enter";

  const user = {
    handleOrEmail: getUserHandle(),
    password: getUserPassword(),
  };

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

      if(userId === 'Enter') {
        session.cookie = '';
        handleError("Failed to login user: "+user.handleOrEmail);
        return;
      }

      updateLoginStatus(true,user.handleOrEmail);
      vscode.window.showInformationMessage(`Login Successful. Welcome ${userId}!!!`);
    })
    .catch((err: any) => {
      handleError(err);
    });
}

function handleError(error: any) {
  console.error(error);
  const userHandle = getUserHandle();
  updateLoginStatus(false,userHandle);
}

export default login;
