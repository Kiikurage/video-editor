import { promises as fs } from 'fs';
import { assert } from '../lib/util';
import { BaseObject } from './objects/BaseObject';

interface SerializedProject {
    fps: number;
    viewport: {
        width: number;
        height: number;
        backgroundColor: number;
    };
    objects: BaseObject[];
}

export interface Project {
    filePath: string | null;
    isSaved: boolean;
    fps: number;
    viewport: {
        width: number;
        height: number;
        backgroundColor: number;
    };
    objects: BaseObject[];
}

export const Project = {
    create: (): Project => ({
        filePath: null,
        isSaved: false,
        fps: 60,
        viewport: { width: 1920, height: 1080, backgroundColor: 0xffffff },
        objects: [],
    }),
    async save(project: Project): Promise<void> {
        const { filePath, isSaved, ...serializedProject } = project;
        if (isSaved) {
            return;
        }
        assert(filePath !== null, 'File path must be specified');

        return await fs.writeFile(filePath, JSON.stringify(serializedProject), 'utf8');
    },
    async open(path: string): Promise<Project> {
        const serializedProject = JSON.parse(await fs.readFile(path, 'utf8')) as SerializedProject;

        return {
            ...serializedProject,
            filePath: path,
            isSaved: true,
        };
    },
    computeDurationInMS(project: Project): number {
        return Math.max(0, ...project.objects.map((o) => o.endInMS));
    },
} as const;
