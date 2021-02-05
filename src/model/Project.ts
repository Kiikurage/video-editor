import { promises as fs } from 'fs';
import * as path from 'path';
import { UUID } from '../lib/UUID';
import { BaseObject } from './objects/BaseObject';
import { CaptionObject } from './objects/CaptionObject';
import { ImageObject } from './objects/ImageObject';
import { VideoObject } from './objects/VideoObject';

export interface Project {
    fps: number;
    viewport: {
        width: number;
        height: number;
    };
    objects: BaseObject[];
}

export const Project = {
    EMPTY: {
        fps: 60,
        viewport: { width: 1920, height: 1080 },
        objects: [],
    } as Project,
    async save(path: string, project: Project): Promise<void> {
        return await fs.writeFile(path, JSON.stringify(project), 'utf8');
    },
    async open(path: string): Promise<Project> {
        return JSON.parse(await fs.readFile(path, 'utf8')) as Project;
    },
} as const;

export const MOCK_PROJECT: Project = {
    fps: 30,
    viewport: {
        width: 1920,
        height: 1080,
    },
    objects: [
        {
            id: UUID(),
            type: VideoObject.type,
            startInMS: 0,
            endInMS: 4 * 60 * 1000,
            srcFilePath: path.resolve(__dirname, '../src/static/video.mp4'),
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        } as VideoObject,
        {
            id: UUID(),
            type: ImageObject.type,
            startInMS: 3000,
            endInMS: 20000,
            x: 100,
            y: 100,
            width: 400,
            height: 400,
            srcFilePath: path.resolve(__dirname, '../src/static/image.png'),
        } as ImageObject,
        {
            id: UUID(),
            type: CaptionObject.type,
            startInMS: 5000,
            endInMS: 8000,
            text: '最初の字幕',
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        } as CaptionObject,
        {
            id: UUID(),
            type: CaptionObject.type,
            startInMS: 10000,
            endInMS: 15000,
            text: '2番目の字幕',
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        } as CaptionObject,
    ],
};
