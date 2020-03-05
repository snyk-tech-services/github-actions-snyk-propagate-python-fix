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
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = require("@octokit/rest");
var getOctoHandler = function (token) {
    return new rest_1.Octokit({
        auth: token,
    });
};
exports.getOctoHandler = getOctoHandler;
var amendFileInBranchOfRepo = function (octo, org, repo, branch, targetFileName, filesToAmend, treeItems, currentCommit) {
    if (branch === void 0) { branch = "changes-branch"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var filesBlobs, pathsForBlobs, newTree, commitMessage, newCommit, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, Promise.all(filesToAmend.map(createBlobForFile(octo, org, repo)))];
                case 1:
                    filesBlobs = _a.sent();
                    pathsForBlobs = treeItems.map(function (item) { return item.path; });
                    return [4 /*yield*/, createNewTree(octo, org, repo, filesBlobs, pathsForBlobs, currentCommit.treeSha)];
                case 2:
                    newTree = _a.sent();
                    commitMessage = "Propagating Snyk fixes to " + targetFileName;
                    return [4 /*yield*/, createNewCommit(octo, org, repo, commitMessage, newTree.sha, currentCommit.commitSha)];
                case 3:
                    newCommit = _a.sent();
                    return [4 /*yield*/, setBranchToCommit(octo, org, repo, branch, newCommit.sha)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.amendFileInBranchOfRepo = amendFileInBranchOfRepo;
var getFileToAmend = function (octo, org, repo, fileSha) { return __awaiter(void 0, void 0, void 0, function () {
    var blob, buff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, octo.git.getBlob({
                    owner: org,
                    repo: repo,
                    file_sha: fileSha
                })];
            case 1:
                blob = _a.sent();
                buff = Buffer.from(blob.data.content, 'base64');
                return [2 /*return*/, buff.toString('utf-8')];
        }
    });
}); };
exports.getFileToAmend = getFileToAmend;
var getCurrentCommitTree = function (octo, org, repo, treeSha) { return __awaiter(void 0, void 0, void 0, function () {
    var tree;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, octo.git.getTree({
                    owner: org,
                    repo: repo,
                    tree_sha: treeSha
                })];
            case 1:
                tree = _a.sent();
                return [2 /*return*/, tree];
        }
    });
}); };
exports.getCurrentCommitTree = getCurrentCommitTree;
var getCurrentCommit = function (octo, org, repo, branch) {
    if (branch === void 0) { branch = 'master'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var refData, commitSha, commitData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octo.git.getRef({
                        owner: org,
                        repo: repo,
                        ref: "heads/" + branch,
                    })];
                case 1:
                    refData = (_a.sent()).data;
                    commitSha = refData.object.sha;
                    return [4 /*yield*/, octo.git.getCommit({
                            owner: org,
                            repo: repo,
                            commit_sha: commitSha,
                        })];
                case 2:
                    commitData = (_a.sent()).data;
                    return [2 /*return*/, {
                            commitSha: commitSha,
                            treeSha: commitData.tree.sha,
                        }];
            }
        });
    });
};
exports.getCurrentCommit = getCurrentCommit;
var createBlobForFile = function (octo, org, repo) { return function (content) { return __awaiter(void 0, void 0, void 0, function () {
    var blobData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, octo.git.createBlob({
                    owner: org,
                    repo: repo,
                    content: content,
                    encoding: 'utf-8',
                })];
            case 1:
                blobData = _a.sent();
                return [2 /*return*/, blobData.data];
        }
    });
}); }; };
exports.createBlobForFile = createBlobForFile;
var createNewTree = function (octo, owner, repo, blobs, paths, parentTreeSha) { return __awaiter(void 0, void 0, void 0, function () {
    var tree, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tree = blobs.map(function (_a, index) {
                    var sha = _a.sha;
                    return ({
                        path: paths[index],
                        mode: "100644",
                        type: "blob",
                        sha: sha,
                    });
                });
                return [4 /*yield*/, octo.git.createTree({
                        owner: owner,
                        repo: repo,
                        tree: tree,
                        base_tree: parentTreeSha,
                    })];
            case 1:
                data = (_a.sent()).data;
                return [2 /*return*/, data];
        }
    });
}); };
exports.createNewTree = createNewTree;
var createNewCommit = function (octo, org, repo, message, currentTreeSha, currentCommitSha) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, octo.git.createCommit({
                    owner: org,
                    repo: repo,
                    message: message,
                    tree: currentTreeSha,
                    parents: [currentCommitSha],
                })];
            case 1: return [2 /*return*/, (_a.sent()).data];
        }
    });
}); };
exports.createNewCommit = createNewCommit;
var setBranchToCommit = function (octo, org, repo, branch, commitSha) {
    if (branch === void 0) { branch = "master"; }
    return octo.git.updateRef({
        owner: org,
        repo: repo,
        ref: "heads/" + branch,
        sha: commitSha,
    });
};
exports.setBranchToCommit = setBranchToCommit;
//# sourceMappingURL=octokit.js.map