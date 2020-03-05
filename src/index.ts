const github = require('@actions/github')
const core = require('@actions/core')
import * as Snyk from './snyk'
import * as Octokit from './octokit'



const propagateSnykPythonFix = async (token: string, org: string, repo: string, branch: string, sourceFilename: string, targetFilename: string, diffUrl: string): Promise<void> => {

    let changeSet = await Snyk.getSnykFixes(diffUrl,sourceFilename);

    const octo = Octokit.getOctoHandler(token)

    const currentCommit = await Octokit.getCurrentCommit(octo, org, repo, branch)
    const treeSha = currentCommit.treeSha;
    const currentTree = await Octokit.getCurrentCommitTree(octo, org, repo, treeSha);
    
    const relevantTreeItems = currentTree.data.tree.filter(element => element.path.includes(targetFilename))
    let filesToAmend = await Promise.all(relevantTreeItems.map(item => Octokit.getFileToAmend(octo, org, repo, item.sha)))

    const filesToAmendHash = JSON.stringify(filesToAmend)
    filesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
    
    if(JSON.stringify(filesToAmend) != filesToAmendHash){
        await Octokit.amendFileInBranchOfRepo(octo, org, repo,branch,sourceFilename,filesToAmend,relevantTreeItems,currentCommit)
    } else {
        console.log("No fix propagation required")
    }
}

const getChangesInFilesToAmend = (changeSet: object[], filesToAmend: string[]): string[] => {
    let changesInFilesToAmend: string[] = filesToAmend
    const regex = RegExp('[=<>!~]');
    changeSet.forEach(changeInFile => {
        changeInFile['changes'].forEach(change => {
            if(change.startsWith("+") && changesInFilesToAmend.some(item => item.includes(change.substring(1).split(regex)[0]) && !regex.test(item))){
                
                changesInFilesToAmend = changesInFilesToAmend.map(item => {
                    item = item.replace(/(\r\n|\n|\r)/gm,"")
                    item = item.replace(change.substring(1).split(regex)[0],"")
                    return item
                })
            }
            if(change.startsWith("-")) {
                changesInFilesToAmend = changesInFilesToAmend.map(item => item.replace(change.substring(1)+"\n", ""))
            }
            if(change.startsWith("+") && !changesInFilesToAmend.some(item => item.includes(change.substring(1)))){
                changesInFilesToAmend = changesInFilesToAmend.map(item => {
                    
                    if(!item.endsWith('\n') && item){
                        item = item+'\n'
                    }
                    return item+change.substring(1)
                })
            }

        })
        
    })
    return changesInFilesToAmend;
}

async function runAction() {
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    const ghToken = core.getInput('myToken');
    const sourceFilename = core.getInput('sourceFilename')
    const targetFilename = core.getInput('targetFilename')

    const payload = github.context.payload
  
    const ORGANIZATION = payload.organization.login
    const REPO = payload.pull_request.base.repo.name
    const BRANCH = payload.pull_request.head.ref
    const DIFFURL = payload.pull_request.diff_url
    //`https://patch-diff.githubusercontent.com/raw/mtyates/puppet_webapp/pull/3.diff`
    console.log("running on "+BRANCH)
    propagateSnykPythonFix(ghToken,ORGANIZATION,REPO,BRANCH,sourceFilename,targetFilename,DIFFURL)
}

runAction();

export {
    getChangesInFilesToAmend
}




