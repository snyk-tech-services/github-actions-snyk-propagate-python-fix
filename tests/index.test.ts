import {getChangesInFilesToAmend} from '../src/index'
import fs, { readFileSync } from 'fs'

describe('Verify the changes in files logic before commit new tree', () => {
   
    it('Extract and consolidate changes correctly', () => {
        const changeSet = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements.txt','utf-8'))
        let filesToAmend = []
        filesToAmend.push(readFileSync(__dirname + '/fixtures/filesToAmend/requirements.in','utf-8'))

        const changeInFilesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
        let expected = []
        expected.push(readFileSync(__dirname + '/fixtures/changesInFilesToAmend/requirements.in','utf-8'))
        expect(changeInFilesToAmend).toEqual(expected);
    });

    it('Extract and consolidate changes correctly even without newline', () => {
        const changeSet = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements.txt','utf-8'))
        let filesToAmend = []
        filesToAmend.push(readFileSync(__dirname + '/fixtures/filesToAmend/requirements-without-newline.in','utf-8'))

        const changeInFilesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
        let expected = []
        expected.push(readFileSync(__dirname + '/fixtures/changesInFilesToAmend/requirements.in','utf-8'))
        expect(changeInFilesToAmend).toEqual(expected);
    });

    it('Extract and consolidate changes correctly without touching what should not be touched', () => {
        const changeSet = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements.txt','utf-8'))
        let filesToAmend = []
        filesToAmend.push(readFileSync(__dirname + '/fixtures/filesToAmend/requirements-with-side-deps-tobe-untouched.in','utf-8'))

        const changeInFilesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
        let expected = []
        expected.push(readFileSync(__dirname + '/fixtures/changesInFilesToAmend/requirements-with-side-deps-tobe-untouched.in','utf-8'))
        expect(changeInFilesToAmend).toEqual(expected);
    });
  

    it('Real world scenario', () => {
        const changeSet = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements.txt','utf-8'))
        let filesToAmend = []
        filesToAmend.push(readFileSync(__dirname + '/fixtures/filesToAmend/requirements-real.in','utf-8'))

        const changeInFilesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
        let expected = []
        expected.push(readFileSync(__dirname + '/fixtures/changesInFilesToAmend/requirements-real.in','utf-8'))
        expect(changeInFilesToAmend).toEqual(expected);
    });

    it('Real world scenario in requirements3.txt', () => {
        const changeSet = JSON.parse(readFileSync(__dirname + '/fixtures/changeSets/requirements3.txt','utf-8'))
        let filesToAmend = []
        filesToAmend.push(readFileSync(__dirname + '/fixtures/filesToAmend/requirements3.in','utf-8'))

        const changeInFilesToAmend = getChangesInFilesToAmend(changeSet, filesToAmend)
        let expected = []
        expected.push(readFileSync(__dirname + '/fixtures/changesInFilesToAmend/requirements3.in','utf-8'))
        expect(changeInFilesToAmend).toEqual(expected);
    });
  });