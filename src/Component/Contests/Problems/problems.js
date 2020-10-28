"use strict";
exports.__esModule = true;
var axios_1 = require("../../../helper/axios/axios");
var cheerio = require("cheerio");
var path = require("path");
var problem_1 = require("./problem");
var Problems = /** @class */ (function () {
    function Problems(userHandle, contestId, problemsArr) {
        this.problemsArr = [];
        this.userHandle = userHandle;
        this.contestId = contestId;
        this.problemsArr = problemsArr;
    }
    Problems.prototype.fetchProblems = function () {
        var _this = this;
        var contestApiUrl = "/api/contest.standings?contestId=" + this.contestId + "&handles=" + this.userHandle + "&showUnofficial=true";
        return axios_1["default"].get(contestApiUrl).then(function (res) {
            var data = res.data.result;
            var problemsArrList = data.problems;
            console.log(problemsArrList);
            var promiseArr = [];
            problemsArrList.forEach(function (problemObject) {
                var problem = new problem_1["default"](_this.userHandle, _this.contestId, problemObject.index);
                var promise = problem.fetchProblemData().then(function () {
                    _this.problemsArr.push(problem);
                    return;
                });
                console.log("Promise");
                console.log(promise);
                promiseArr.push(promise);
            });
            return Promise.all(promiseArr);
        });
    };
    return Problems;
}());
// function getProblems(contestId: number): Thenable<Explorer[]> {
//   const url = "/contest/" + contestId;
//   return axios.get(url).then((res: any) => {
//     const $ = cheerio.load(res.data);
//     const problemsArr = $(".problemsArr tr");
//     let problemsArrData: any = {};
//     problemsArr.each((idx: number, problem: any) => {
//       if (idx === 0) {
//         return null;
//       }
//       const problemData = getProblemData($, problem);
//       problemsArrData[problemData.id] = problemData;
//     });
//     const acceptedProblems = $(".accepted-problem");
//     acceptedProblems.each((idx: number, problem: any) => {
//       const id = $(problem).find(".id > a").text().trim();
//       console.log("Accepted Problems: " + id);
//       problemsArrData[id].accepted = true;
//     });
//     console.log(problemsArrData);
//     return Object.keys(problemsArrData).map((id: any) => {
//       const problem = problemsArrData[id];
//       let lightIconPath = null;
//       let darkIconPath = null;
//       if(problem.accepted) {
//         lightIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "light", "ac.svg");
//         darkIconPath = path.join(__filename, "..", "..", "..", "..", "..", "res", "img", "dark", "ac.svg");
//         console.log(lightIconPath);
//       }
//       return new Explorer(
//         `${problem.id}: ${problem.name}`,
//         "Problem",
//         vscode.TreeItemCollapsibleState.None,
//         contestId,
//         "Problem",
//         problem.name,
//         problem,
//         lightIconPath,
//         darkIconPath
//       );
//     });
//   });
// }
// function getProblemData($: any, problem: any) {
//   const id = $(problem).find(".id > a").text().trim();
//   const name = $($(problem).find("td")["1"])
//     .find("div > div > a")
//     .text()
//     .trim();
//   const numberOfSolves = $(
//     $(problem).find("a[title='Participants solved the problem']")
//   )
//     .text()
//     .replace("x", "")
//     .trim();
//   const accepted = false;
//   const problemData = { id, name, numberOfSolves, accepted };
//   return problemData;
// }
// export default getProblems;
exports["default"] = Problems;
