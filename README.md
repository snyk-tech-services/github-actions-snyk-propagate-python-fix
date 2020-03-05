# Alpha version here ! Still be finalized

# Github action propagating fixes injected in requirements.tx into requirement.in


## Usage

Public github action makes it very easy to use. 
In your repo:
1. Add your github token as a secret
2. Create .github/workflows/main.yaml with the following

```
on: 
  pull_request:
      types: [opened]

jobs:
  snyk_fix_propagate:
    runs-on: ubuntu-latest
    name: Snyk post processing
    steps:
    - name: Fix propagation
      id: snyk-job
      uses: snyk-tech-services/github-actions-test1@v8
      with:
        myToken: ${{ secrets.ghToken }}```

Once there, any newly opened PR containing requirements.txt changes will see those changes carried over to requirements.in