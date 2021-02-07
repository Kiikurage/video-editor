import { Project } from '../model/Project';

export interface AppState {
    project: Project;
    selectedObjectId: string | null;
    previewTimeInMS: number;
}
