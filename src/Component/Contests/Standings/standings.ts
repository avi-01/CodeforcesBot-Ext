import * as vscode from "vscode";
import axios from "../../../helper/axios/axios";
const cheerio = require("cheerio");
const path = require("path");


class Standing {

    userHandle;
    userRanking;
    problemsSolved;
    contestId;

    constructor (userHandle: string, contestId: number, userRanking?: number, problemsSolved?: any) {
        this.userHandle = userHandle;
        this.contestId = contestId;

        this.userRanking = userRanking;
        this.problemsSolved = problemsSolved;
    }


    getStanding() {
        const standingUrl: string = `api/contest.standings?contestId=${this.contestId}&handles&showUnofficial=true`;
        return axios.get("")
    }

}