# Alpha version here ! Still to be finalized

# Github action propagating fixes injected in requirements.tx into requirements.in


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
      uses: snyk-tech-services/github-actions-snyk-propagate-python-fix@v2
      with:
        myToken: ${{ secrets.ghToken }}
```
        

Once there, any newly opened PR containing requirements.txt changes will see those changes carried over to requirements.in
Note that it will only trigger for PR from branches which names start with `snyk-fix-`

### Optional Action Inputs to override default values
In the `with` section of your action, you can specify
- `sourceFilename` - The "source" filename (by default requirements.txt) containing the snyk fixes (still in a requirements.txt like format)
- `targetFilename` - The "target" filename (by default requirements.in) where those fixes will be copied over
- `branchPattern` - The branch pattern (by default to `snyk-fix-`) to filter on upon PR opening to then trigger this logic.