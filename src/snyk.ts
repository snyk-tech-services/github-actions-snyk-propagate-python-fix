import {parse} from 'what-the-diff'
import axios from 'axios'

const getSnykFixes = async (diff_url: string, targetFileName: string): Promise<object[]> => {
    const diffStr = await axios.get(diff_url)
    
    let data = parse(diffStr.data);
    let changes = [];
    data.forEach(element => {
        if(element.newPath.includes(targetFileName)){
            changes.push({path: element.newPath, changes: element.hunks[0].lines.filter(change => change.startsWith("+") || change.startsWith("-"))})
        }
    });
    return changes;
}

export { getSnykFixes }