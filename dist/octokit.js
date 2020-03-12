"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const getOctoHandler = (token) => {
    return new rest_1.Octokit({
        auth: token,
    });
};
exports.getOctoHandler = getOctoHandler;
const amendFileInBranchOfRepo = async (octo, org, repo, branch = `changes-branch`, targetFileName, filesToAmend, treeItems, currentCommit) => {
    try {
        const filesBlobs = await Promise.all(filesToAmend.map(createBlobForFile(octo, org, repo)));
        const pathsForBlobs = treeItems.map(item => item.path);
        const newTree = await createNewTree(octo, org, repo, filesBlobs, pathsForBlobs, currentCommit.treeSha);
        const commitMessage = `Propagating Snyk fixes to ` + targetFileName;
        const newCommit = await createNewCommit(octo, org, repo, commitMessage, newTree.sha, currentCommit.commitSha);
        await setBranchToCommit(octo, org, repo, branch, newCommit.sha);
    }
    catch (err) {
        console.log(err);
    }
};
exports.amendFileInBranchOfRepo = amendFileInBranchOfRepo;
const getFileToAmend = async (octo, org, repo, fileSha) => {
    const blob = await octo.git.getBlob({
        owner: org,
        repo,
        file_sha: fileSha
    });
    let buff = Buffer.from(blob.data.content, 'base64');
    return buff.toString('utf-8');
};
exports.getFileToAmend = getFileToAmend;
const getCurrentCommitTree = async (octo, org, repo, treeSha) => {
    const tree = await octo.git.getTree({
        owner: org,
        repo,
        tree_sha: treeSha
    });
    return tree;
};
exports.getCurrentCommitTree = getCurrentCommitTree;
const getCurrentCommit = async (octo, org, repo, branch = 'master') => {
    const { data: refData } = await octo.git.getRef({
        owner: org,
        repo,
        ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;
    const { data: commitData } = await octo.git.getCommit({
        owner: org,
        repo,
        commit_sha: commitSha,
    });
    return {
        commitSha,
        treeSha: commitData.tree.sha,
    };
};
exports.getCurrentCommit = getCurrentCommit;
const createBlobForFile = (octo, org, repo) => async (content) => {
    const blobData = await octo.git.createBlob({
        owner: org,
        repo,
        content,
        encoding: 'utf-8',
    });
    return blobData.data;
};
exports.createBlobForFile = createBlobForFile;
const createNewTree = async (octo, owner, repo, blobs, paths, parentTreeSha) => {
    const tree = blobs.map(({ sha }, index) => ({
        path: paths[index],
        mode: `100644`,
        type: `blob`,
        sha,
    }));
    const { data } = await octo.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentTreeSha,
    });
    return data;
};
exports.createNewTree = createNewTree;
const createNewCommit = async (octo, org, repo, message, currentTreeSha, currentCommitSha) => (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
})).data;
exports.createNewCommit = createNewCommit;
const setBranchToCommit = (octo, org, repo, branch = `master`, commitSha) => octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
});
exports.setBranchToCommit = setBranchToCommit;
//# sourceMappingURL=octokit.js.map