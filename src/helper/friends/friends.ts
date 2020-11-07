import { AxiosResponse } from "axios";
import axios from "../axios/axios";
import { getCsrfToken } from "../data/data";
import FileHandler from "../fileHandler/fileHandler";
import login from "../Login/login";

const cheerio = require("cheerio");

export default async function getFriends(): Promise<string[]> {
  if (!getCsrfToken()) {
    const logged = await login();
    if (!logged) {
      return [];
    }
  }

  const friendsUrl = `/friends`;

  return axios.get(friendsUrl).then((res: AxiosResponse) => {
    const data = res.data;

    const userFriends: string[] = [];

    FileHandler.createFile("/mnt/9A84BA6F84BA4E0F/Projects/CodeforcesBot/codeforcesbot-ext/src/helper/submit/output.html",data);

    const $ = cheerio.load(data);

    const rows = $(".datatable a");

    rows.each((i: number, row: any) => {
        userFriends.push($(row).text());
    });

    return userFriends;
  });
}
