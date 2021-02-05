import { promises as fs } from 'fs';
import { BaseObject } from './objects/BaseObject';

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
