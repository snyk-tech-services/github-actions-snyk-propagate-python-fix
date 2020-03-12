import {parse} from 'what-the-diff'
import axios from 'axios'

const getSnykFixes = async (diff_url: string, targetFileName: string): Promise<object[]> => {
    const diffStr = await axios.get(diff_url)
    
    let data = parse(diffStr.data);
    let changes = [];
    data.forEach(element => {
        
        if(element.newPath.includes(targetFileName)){
            let changeHunksConsolidated : string[] = []
            for(let i=0;i<element.hunks.length;i++){
                changeHunksConsolidated = changeHunksConsolidated.concat(element.hunks[i].lines.filter(change => change.startsWith("+") || change.startsWith("-")))   
            }
            changes.push({path: element.newPath, changes: changeHunksConsolidated})
            
        }
    });
    return changes;
}

export { getSnykFixes }