"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var github = require('@actions/github');
var core = require('@actions/core');
var Snyk = __importStar(require("./snyk"));
var Octokit = __importStar(require("./octokit"));
var propagateSnykPythonFix = function (token, org, repo, branch, sourceFilename, targetFilename, diffUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var changeSet, octo, currentCommit, treeSha, currentTree, relevantTreeItems, filesToAmend, filesToAmendHash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Snyk.getSnykFixes(diffUrl, sourceFilename)];
            case 1:
                changeSet = _a.sent();
                octo = Octokit.getOctoHandler(token);
                return [4 /*yield*/, Octokit.getCurrentCommit(octo, org, repo, branch)];
            case 2:
                currentCommit = _a.sent();
                treeSha = currentCommit.treeSha;
                return [4 /*yield*/, Octokit.getCurrentCommitTree(octo, org, repo, treeSha)];
            case 3:
                currentTree = _a.sent();
                relevantTreeItems = currentTree.data.tree.filter(function (element) { return element.path.includes(targetFilename); });
                return [4 /*yield*/, Promise.all(relevantTreeItems.map(function (item) { return Octokit.getFileToAmend(octo, org, repo, item.sha); }))];
            case 4:
                filesToAmend = _a.sent();
                filesToAmendHash = JSON.stringify(filesToAmend);
                filesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend);
                if (!(JSON.stringify(filesToAmend) != filesToAmendHash)) return [3 /*break*/, 6];
                return [4 /*yield*/, Octokit.amendFileInBranchOfRepo(octo, org, repo, branch, sourceFilename, filesToAmend, relevantTreeItems, currentCommit)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                console.log("No fix propagation required");
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); };
var getChangesInFilesToAmend = function (changeSet, filesToAmend) {
    var changesInFilesToAmend = filesToAmend;
    var regex = RegExp('[=<>!~]');
    changeSet.forEach(function (changeInFile) {
        changeInFile['changes'].forEach(function (change) {
            if (change.startsWith("+") && changesInFilesToAmend.some(function (item) { return item.includes(change.substring(1).split(regex)[0]) && !regex.test(item); })) {
                changesInFilesToAmend = changesInFilesToAmend.map(function (item) {
                    item = item.replace(/(\r\n|\n|\r)/gm, "");
                    item = item.replace(change.substring(1).split(regex)[0], "");
                    return item;
                });
            }
            if (change.startsWith("-")) {
                changesInFilesToAmend = changesInFilesToAmend.map(function (item) { return item.replace(change.substring(1) + "\n", ""); });
            }
            if (change.startsWith("+") && !changesInFilesToAmend.some(function (item) { return item.includes(change.substring(1)); })) {
                changesInFilesToAmend = changesInFilesToAmend.map(function (item) {
                    if (!item.endsWith('\n') && item) {
                        item = item + '\n';
                    }
                    return item + change.substring(1);
                });
            }
        });
    });
    return changesInFilesToAmend;
};
exports.getChangesInFilesToAmend = getChangesInFilesToAmend;
function runAction() {
    return __awaiter(this, void 0, void 0, function () {
        var ghToken, sourceFilename, targetFilename, payload, ORGANIZATION, REPO, BRANCH, DIFFURL;
        return __generator(this, function (_a) {
            ghToken = core.getInput('myToken');
            sourceFilename = core.getInput('sourceFilename');
            targetFilename = core.getInput('targetFilename');
            payload = github.context.payload;
            ORGANIZATION = payload.organization.login;
            REPO = payload.pull_request.base.repo.name;
            BRANCH = payload.pull_request.head.ref;
            DIFFURL = payload.pull_request.diff_url;
            //`https://patch-diff.githubusercontent.com/raw/mtyates/puppet_webapp/pull/3.diff`
            console.log("running on " + BRANCH);
            propagateSnykPythonFix(ghToken, ORGANIZATION, REPO, BRANCH, sourceFilename, targetFilename, DIFFURL);
            return [2 /*return*/];
        });
    });
}
runAction();
//# sourceMappingURL=index.js.map