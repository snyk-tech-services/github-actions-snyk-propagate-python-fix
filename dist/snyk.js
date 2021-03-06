"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const what_the_diff_1 = require("what-the-diff");
const axios_1 = __importDefault(require("axios"));
const getSnykFixes = async (diff_url, targetFileName) => {
    const diffStr = await axios_1.default.get(diff_url);
    let data = what_the_diff_1.parse(diffStr.data);
    let changes = [];
    data.forEach(element => {
        if (element.newPath.includes(targetFileName)) {
            let changeHunksConsolidated = [];
            for (let i = 0; i < element.hunks.length; i++) {
                changeHunksConsolidated = changeHunksConsolidated.concat(element.hunks[i].lines.filter(change => change.startsWith("+") || change.startsWith("-")));
            }
            changes.push({ path: element.newPath, changes: changeHunksConsolidated });
        }
    });
    return changes;
};
exports.getSnykFixes = getSnykFixes;
//# sourceMappingURL=snyk.js.map