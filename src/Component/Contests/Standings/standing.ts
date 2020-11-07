import { AxiosResponse } from "axios";
import * as vscode from "vscode";
import { Explorer } from "../../../Container/explorer";
import axios from "../../../helper/axios/axios";
import { getUserHandle } from "../../../helper/data/data";

class Standing {
  userHandle;
  contestId;
  points;
  rank;

  constructor(userHandle: string, contestId: number, rank: string = "0", points: number = 0) {
    this.userHandle = userHandle;
    this.contestId = contestId;

    this.rank = rank;
    this.points = points;
  }

  getStanding() {
    const standingUrl = `/api/contest.standings?contestId=${this.contestId}&handles=${this.userHandle}&showUnofficial=true`;
    return axios.get(standingUrl).then((res: AxiosResponse) => {
      console.log(res);
      const data = res.data.result.rows;

      const handlesContestData = data.filter((handleData: any) => {
        return handleData.party.participantType === "CONTESTANT";
      });

      if(handlesContestData.length === 0) {
        return;
      }

      const handleRank = handlesContestData[0].rank;
      const handlePoints = handlesContestData[0].points;

      this.rank = handleRank;
      this.points = handlePoints;
    
    });
      
  }


  toExplorer(): Explorer {

    let label = `${this.rank} : ${this.userHandle}`;
    
    if(this.userHandle === getUserHandle()) {
      label = `---> ${this.rank} : ${this.userHandle}`;
    }

    const problemExplorer = new Explorer(
      label,
      "Standing",
      vscode.TreeItemCollapsibleState.None,
      this.contestId,
      "Standing",
    );

    return problemExplorer;
  }
}

export default Standing;
