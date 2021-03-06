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
    let changesInFilesToAmend: string[][] = filesToAmend.map(item => item.split("\n"))
    const regex = RegExp('[#=<>!~]');

    changeSet.forEach(changeInFile => {
        changeInFile['changes'].forEach(change => {
            if(change.startsWith("-")) {
                changesInFilesToAmend = changesInFilesToAmend.map(item => {
                    let itemArray = item as Array<string>
                    return itemArray.map(dep => dep.replace(change.substring(1), ""))
                })
            }
            if(change.startsWith("+")){
                
                changesInFilesToAmend = changesInFilesToAmend.map(item => {
                    let itemArray = item as Array<string>
                    let changeInjected = false
                    itemArray = itemArray.map(dep => {
                        let dependency = dep
                        if(dep.split(regex)[0] && change.toLowerCase().substring(1).split(regex)[0].includes(dep.toLowerCase().split(regex)[0])){
                            dependency = change.substring(1)
                            changeInjected = true
                        }
                        return dependency

                    })
                    if(!changeInjected){
                        itemArray.push(change.substring(1))
                        changeInjected = true
                    }
                    return itemArray
                })
            }

        })
        
    })
    
    return changesInFilesToAmend.map(item => item.join("\n"));
}

async function runAction() {
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    try{
        const ghToken = core.getInput('myToken');
        const sourceFilename = core.getInput('sourceFilename')
        const targetFilename = core.getInput('targetFilename')
        const snykFixBranchPattern = core.getInput('branchPattern')
        
        const payload = github.context.payload
    
        const ORGANIZATION = payload.organization.login
        const REPO = payload.pull_request.base.repo.name
        const BRANCH = payload.pull_request.head.ref
        const DIFFURL = payload.pull_request.diff_url
        //`https://patch-diff.githubusercontent.com/raw/mtyates/puppet_webapp/pull/3.diff`
        
        if(BRANCH.startsWith(snykFixBranchPattern)) {    
            propagateSnykPythonFix(ghToken,ORGANIZATION,REPO,BRANCH,sourceFilename,targetFilename,DIFFURL)
        }
    } catch(err) {
        console.log(err)
    }
}

runAction();

export {
    getChangesInFilesToAmend
}




