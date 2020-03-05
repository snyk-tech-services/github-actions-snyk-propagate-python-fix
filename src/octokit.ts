import {Octokit} from '@octokit/rest'


const getOctoHandler = (token) => {
    return new Octokit({
        auth: token,
    })
}

const amendFileInBranchOfRepo = async (
    octo: Octokit,
    org: string,
    repo: string,
    branch: string = `changes-branch`,
    targetFileName: string,
    filesToAmend: string[],
    treeItems,
    currentCommit
  ) => {


    try {    
      const filesBlobs = await Promise.all(filesToAmend.map(createBlobForFile(octo, org, repo)))
      
      const pathsForBlobs = treeItems.map(item => item.path)
      const newTree = await createNewTree(
        octo,
        org,
        repo,
        filesBlobs,
        pathsForBlobs,
        currentCommit.treeSha
      )

      
      const commitMessage = `Propagating Snyk fixes to `+targetFileName
      const newCommit = await createNewCommit(
        octo,
        org,
        repo,
        commitMessage,
        newTree.sha,
        currentCommit.commitSha
      )
      await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
    } catch (err){
        console.log(err);
    }
  }


const getFileToAmend = async (
    octo: Octokit,
    org: string,
    repo: string,
    fileSha: string
  ) => {
    const blob = await octo.git.getBlob({
        owner: org,
        repo,
        file_sha: fileSha
      });
      let buff = Buffer.from(blob.data.content, 'base64');
      return buff.toString('utf-8');
  }

  const getCurrentCommitTree = async (
    octo: Octokit,
    org: string,
    repo: string,
    treeSha: string
  ) => {
    const tree = await octo.git.getTree({
        owner: org,
        repo,
        tree_sha: treeSha
      })
    return tree
  }
  
  const getCurrentCommit = async (
    octo: Octokit,
    org: string,
    repo: string,
    branch: string = 'master'
  ) => {
    const { data: refData } = await octo.git.getRef({
      owner: org,
      repo,
      ref: `heads/${branch}`,
    })
    const commitSha = refData.object.sha
    const { data: commitData } = await octo.git.getCommit({
      owner: org,
      repo,
      commit_sha: commitSha,
    })
    return {
      commitSha,
      treeSha: commitData.tree.sha,
    }
  }
  
  const createBlobForFile = (octo: Octokit, org: string, repo: string) => async (
    content: string
  ) => {
    const blobData = await octo.git.createBlob({
      owner: org,
      repo,
      content,
      encoding: 'utf-8',
    })
    return blobData.data
  }
  
  const createNewTree = async (
    octo: Octokit,
    owner: string,
    repo: string,
    blobs: Octokit.GitCreateBlobResponse[],
    paths: string[],
    parentTreeSha: string
  ) => {
    const tree = blobs.map(({ sha }, index) => ({
      path: paths[index],
      mode: `100644`,
      type: `blob`,
      sha,
    })) as Octokit.GitCreateTreeParamsTree[]
    const { data } = await octo.git.createTree({
      owner,
      repo,
      tree,
      base_tree: parentTreeSha,
    })
    return data
  }
  
  const createNewCommit = async (
    octo: Octokit,
    org: string,
    repo: string,
    message: string,
    currentTreeSha: string,
    currentCommitSha: string
  ) =>
    (await octo.git.createCommit({
      owner: org,
      repo,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha],
    })).data
  
  const setBranchToCommit = (
    octo: Octokit,
    org: string,
    repo: string,
    branch: string = `master`,
    commitSha: string
  ) =>
    octo.git.updateRef({
      owner: org,
      repo,
      ref: `heads/${branch}`,
      sha: commitSha,
    })


export {
    getOctoHandler,
    amendFileInBranchOfRepo,
    getFileToAmend,
    getCurrentCommitTree,
    getCurrentCommit,
    createBlobForFile,
    createNewTree,
    createNewCommit,
    setBranchToCommit
}