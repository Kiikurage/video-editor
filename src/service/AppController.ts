import { EventEmitter } from 'events';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { showSaveFileDialog } from '../ipc/renderer/showSaveFileDialog';
import { assert } from '../lib/util';
import { BaseObject } from '../model/objects/BaseObject';
import { Project } from '../model/Project';
import { EventEmitterEvents } from '../model/EventEmitterEvents';
import { OutputBuilder } from './OutputBuilder';
import { PreviewController } from './PreviewController';

type AppControllerEvents = EventEmitterEvents<{
    'project.change': void;
    'object.select': void;
}>;

export class AppController extends EventEmitter implements AppControllerEvents {
    private readonly _previewController = new PreviewController();
    private _selectedObjectId: string | null = null;
    private _project: Project = Project.EMPTY;

    get previewController(): PreviewController {
        return this._previewController;
    }

    get project(): Project {
        return this._project;
    }

    get selectedObject(): BaseObject | null {
        if (this.selectedObjectId === null) return null;

        return this.project.objects.find((object) => object.id === this.selectedObjectId) ?? null;
    }

    get selectedObjectId(): string | null {
        return this._selectedObjectId;
    }

    togglePreviewPlay = (): void => {
        if (this.previewController.paused) {
            this.previewController.play();
        } else {
            this.previewController.pause();
        }
    };

    setProject = (newValue: Project): void => {
        this._project = newValue;
        this.emit('project.change');
    };

    selectObject = (id: string | null): void => {
        this._selectedObjectId = id;
        this.emit('object.select');
    };

    addObject = (object: BaseObject): void => {
        this.setProject({
            ...this.project,
            objects: [...this.project.objects, object],
        });
    };

    updateObject = (newValue: BaseObject): void => {
        const project = this.project;

        const i = project.objects.findIndex((object) => object.id === newValue.id);
        assert(i !== -1, `Object "${newValue.id}" is not found`);

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1, newValue);

        this.setProject({ ...project, objects: newObjects });
    };

    removeObject = (objectId: string): void => {
        const project = this.project;

        const i = project.objects.findIndex((object) => object.id === objectId);
        assert(i !== -1, `Object "${objectId}" is not found`);

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1);

        this.setProject({ ...project, objects: newObjects });
    };

    removeSelectedObject = (): void => {
        if (this.selectedObjectId === null) return;

        this.removeObject(this.selectedObjectId);
    };

    exportVideo = async (): Promise<void> => {
        const project = this.project;
        const outputBuilder = new OutputBuilder().setProject(project).setOutputVideoPath('./output.mp4');

        outputBuilder.on('log', () => {
            console.log(outputBuilder.log);
        });

        try {
            await outputBuilder.build();
        } catch (err) {
            console.error('Failed to export video', err);
            // TODO: クリーンアップされず永遠にゴミが残る
            return;
        }
        //
        // cleanUpWorkspace();
    };

    openProject = async (): Promise<void> => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;

        const newProject = await Project.open(filePaths[0]);
        this.setProject(newProject);
    };

    saveProject = (): void => {
        // TODO:
        void this.saveAsNewProject();
    };

    saveAsNewProject = async (): Promise<void> => {
        const project = this.project;
        const { canceled, filePath } = await showSaveFileDialog();
        if (canceled) return;

        assert(filePath !== undefined, 'WTF?');

        await Project.save(filePath, project);
    };
}
