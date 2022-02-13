import path from 'path';
import {
    FFCreatorCenter,
    FFScene,
    FFImage,
    FFText,
    FFCreator,
} from 'ffcreatorlite';
import { IConvertResutl } from './convert';
const viewWidth = 1920;
const viewHeight = 1080;

export interface ICreateOptions {
    width: number;
    height: number;
    fps: number;
    cacheDir: string;
    outputDir: string;
    output: string;
}

export function createViode(
    inputs: Array<IConvertResutl>,
    options: IConvertResutl
) {
    // create creator instance
    const creator = new FFCreator({
        ...options,
        log: true,
    });
    creator.start();
    creator.on('error', (e: any) => {
        console.log(`FFCreatorLite error:: \n ${e.error}`);
    });
    creator.on('progress', (e: any) => {
        console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
    });

    creator.on('complete', (e: any) => {
        console.log(
            `FFCreatorLite completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `
        );
    });
}
