import { Project } from '../model/Project';

export interface AppState {
    project: Project;
    selectedObjectIds: ReadonlySet<string>;
    previewTimeInMS: number;
}
