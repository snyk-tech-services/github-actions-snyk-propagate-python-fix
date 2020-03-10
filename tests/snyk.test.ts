import * as Snyk from '../src/snyk'
import nock from "nock"
import fs, { readFileSync } from 'fs'



beforeEach(() => {
  return nock('https://fixtures.snyk.io')
  .get(/.*/)
  .reply(200, function(uri, requestBody) {
    return fs.createReadStream( __dirname + '/fixtures/'+uri);//diffs/requirements.txt');      
  });
});

 describe('Verify git diff extraction logic', () => {
  it('Snyk extracts changes from requirements.txt diff', async () => {
    const changes = await Snyk.getSnykFixes('https://fixtures.snyk.io/diffs/requirements.txt','requirements.txt');
    const expected = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements.txt','utf-8'));
    expect(changes).toEqual(expected);
  });


  it('Snyk extracts changes from generic diff', async () => {
    const changes = await Snyk.getSnykFixes('https://fixtures.snyk.io/diffs/generic','generic');
    const expected = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/generic','utf-8'));
    expect(changes).toEqual(expected);
  });

  it('Snyk extracts changes from requirements3.txt diff', async () => {
    const changes = await Snyk.getSnykFixes('https://fixtures.snyk.io/diffs/requirements3.txt','requirements3.txt');
    const expected = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements3.txt','utf-8'));
    expect(changes).toEqual(expected);
  });
});
