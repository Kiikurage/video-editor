import { promises as fs } from 'fs';
import { BaseObject } from './objects/BaseObject';

export interface Project {
    viewport: {
        width: number;
        height: number;
    };
    objects: BaseObject[];
}

export const Project = {
    async save(path: string, project: Project): Promise<void> {
        return await fs.writeFile(path, JSON.stringify(project), 'utf8');
    },
    async open(path: string): Promise<Project> {
        return JSON.parse(await fs.readFile(path, 'utf8')) as Project;
    },
};
