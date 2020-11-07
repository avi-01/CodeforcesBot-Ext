import { AxiosResponse } from "axios";
import { Explorer } from "../../../Container/explorer";
import axios from "../../../helper/axios/axios";
import { getCsrfToken } from "../../../helper/data/data";
import Standing from "./standing";
import login from "../../../helper/Login/login";
const cheerio = require("cheerio");

class Standings {
  userHandle;
  contestId;
  usersStanding: Standing[];

  constructor(userHandle: string, contestId: number) {
    this.userHandle = userHandle;
    this.contestId = contestId;

    this.usersStanding = [];
  }

  async getStandings() {
    if (!getCsrfToken()) {
      const logged = await login();
      if (!logged) {
        return;
      }
    }

    const standingUrl: string = `/contest/${this.contestId}/standings/friends/true`;

    return axios.get(standingUrl).then((res: AxiosResponse) => {
      const $ = cheerio.load(res.data);

      const rows = $("tr");

      console.log(rows);

      rows.each((i: number, row: any) => {
        if (i === 0) {
          return;
        }

        const rank = $(row).find("td").first().text().replace("\n", "").trim();
        const user = $(row).find("td a").first().text().trim();
        const point = $(row).find("td span").first().text().trim();

        console.log(rank);

        if (rank.length <= 0) {
          return;
        }
        const standing = new Standing(user, this.contestId, rank, point);
        this.usersStanding.push(standing);
      });
    });
  }

  toExplorer(): Explorer[] {
    return this.usersStanding.map((standing: Standing) => {
      return standing.toExplorer();
    });
  }
}

export default Standings;
