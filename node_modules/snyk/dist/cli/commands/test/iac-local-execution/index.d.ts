import { IacFileParsed, IacFileParseFailure, IaCTestFlags, SafeAnalyticsOutput, TestReturnValue } from './types';
export declare function test(pathToScan: string, options: IaCTestFlags): Promise<TestReturnValue>;
export declare function removeFileContent({ filePath, fileType, failureReason, projectType, }: IacFileParsed | IacFileParseFailure): SafeAnalyticsOutput;
