import { EventEmitter } from 'events';
import { clipboard } from 'electron';
import * as FileType from 'file-type';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { showSaveFileDialog } from '../ipc/renderer/showSaveFileDialog';
import { encodeProject } from '../lib/ffmpeg/FFMpegCommandBuilder';
import { getImageSize, getVideoSize } from '../lib/getAssetSpacialSize';
import { isNonNull } from '../lib/isNonNull';
import { assert } from '../lib/util';
import { AppState } from '../model/AppState';
import { TypedEventEmitter } from '../model/EventEmitterEvents';
import { HistoryManager } from '../model/HistoryManager';
import { AnimatableValue, AnimatableValueType } from '../model/objects/AnimatableValue';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { ImageObject } from '../model/objects/ImageObject';
import { ObjectParser } from '../model/objects/ObjectParser';
import { VideoObject } from '../model/objects/VideoObject';
import { Project } from '../model/Project';
import { PreviewPlayerController } from './PreviewPlayerController';
import { SnackBarController } from './SnackBarController';

type AppControllerEventEmitter = TypedEventEmitter<{
    'project.open': (newProject: Project) => void;
    'project.change': () => void;
    'object.select': () => void;
}>;

export class AppController extends (EventEmitter as AppControllerEventEmitter) {
    private readonly historyManager: HistoryManager<AppState>;
    private readonly _previewController = new PreviewPlayerController();

    constructor() {
        super();
        this.historyManager = new HistoryManager(this.getState);

        this.on('project.change', () => {
            this.previewController.durationInMS = Project.computeDurationInMS(this.project);
        });
    }

    private _selectedObjectIds: ReadonlySet<string> = new Set<string>();

    get selectedObjectIds(): ReadonlySet<string> {
        return this._selectedObjectIds;
    }

    private _project: Project = Project.create();

    get project(): Project {
        return this._project;
    }

    get previewController(): PreviewPlayerController {
        return this._previewController;
    }

    get selectedObjects(): ReadonlySet<BaseObject> {
        return new Set(this.project.objects.filter((object) => this.selectedObjectIds.has(object.id)));
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

    addObjectToSelection = (id: string): void => {
        if (this._selectedObjectIds.has(id)) return;

        this._selectedObjectIds = new Set([...this._selectedObjectIds, id]);
        this.emit('object.select');
    };

    removeObjectFromSelection = (id: string): void => {
        if (!this._selectedObjectIds.has(id)) return;

        const newSelectedObjectIds = new Set(this._selectedObjectIds);
        newSelectedObjectIds.delete(id);

        this._selectedObjectIds = newSelectedObjectIds;
        this.emit('object.select');
    };

    setSelectedObjects = (ids: string[]): void => {
        this._selectedObjectIds = new Set(ids);
        this.emit('object.select');
    };

    selectAll = (): void => {
        this.setSelectedObjects(this.project.objects.map((object) => object.id));
    };

    addObject = (...objects: BaseObject[]): void => {
        this.setProject({
            ...this.project,
            objects: [...this.project.objects, ...objects],
            isSaved: false,
        });
    };

    updateObject = (newValue: BaseObject): void => {
        const project = this.project;

        const i = project.objects.findIndex((object) => object.id === newValue.id);
        assert(i !== -1, `Object "${newValue.id}" is not found`);

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1, newValue);

        this.setProject({ ...project, objects: newObjects, isSaved: false });
    };

    removeObject = (objectId: string): void => {
        const project = this.project;

        const i = project.objects.findIndex((object) => object.id === objectId);
        assert(i !== -1, `Object "${objectId}" is not found`);

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1);

        if (this.selectedObjectIds.has(objectId)) {
            this.removeObjectFromSelection(objectId);
        }

        this.setProject({ ...project, objects: newObjects, isSaved: false });
    };

    removeSelectedObjects = (): void => {
        this.selectedObjectIds.forEach(this.removeObject);
    };

    exportVideo = async (): Promise<void> => {
        const project = this.project;

        const snackBarMessageId = SnackBarController.showMessage('動画をエンコード中...', { clearAfterInMS: -1 });
        try {
            await encodeProject(project, './output.mp4');

            SnackBarController.clearMessage(snackBarMessageId);
            SnackBarController.showMessage('エンコードが完了しました', { type: 'success' });
        } catch (err) {
            console.error('Failed to export video', err);

            SnackBarController.clearMessage(snackBarMessageId);
            SnackBarController.showMessage('エンコード中にエラーが発生しました', { type: 'error' });
            return;
        }
    };

    openProject = async (): Promise<void> => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;

        const newProject = await Project.open(filePaths[0]);
        this.setProject(newProject);
        this.emit('project.open', newProject);
    };

    saveProject = async (): Promise<void> => {
        if (this.project.isSaved) return;
        if (this.project.filePath === null) return this.saveAsNewProject();

        await Project.save(this.project);

        // TODO: projectはimmutableにすべき
        this.project.isSaved = true;

        SnackBarController.showMessage('保存しました', { type: 'success' });
    };

    saveAsNewProject = async (): Promise<void> => {
        const project = this.project;
        const { canceled, filePath } = await showSaveFileDialog();
        if (canceled) return;

        assert(filePath !== undefined, 'WTF?');
        this.setProject({
            ...project,
            filePath: filePath,
            isSaved: false,
        });

        return this.saveProject();
    };

    undo = (): void => {
        const state = this.historyManager.undo();
        if (state === undefined) return;

        this.restoreFromState(state);
    };

    redo = (): void => {
        const state = this.historyManager.redo();
        if (state === undefined) return;

        this.restoreFromState(state);
    };

    cut = (): void => {
        this.commitHistory(() => {
            this.copy();
            this.removeSelectedObjects();
        });
    };

    copy = (): void => {
        clipboard.writeText(JSON.stringify([...this.selectedObjects].map((object) => object.serialize())));
    };

    paste = (): void => {
        try {
            const objects = (JSON.parse(clipboard.readText()) as string[]).map(ObjectParser.parse);
            this.commitHistory(() => {
                const clonedObjects = objects.map((object) => object.clone());
                this.addObject(...clonedObjects);
                this.setSelectedObjects(clonedObjects.map((object) => object.id));
            });
        } catch (e) {
            console.error(e);
            return;
        }
    };

    commitHistory = (fn: () => void): void => {
        this.historyManager.commit(fn);
    };

    importAssetFromFile = async (filePath: string): Promise<void> => {
        const fileType = await FileType.fromFile(filePath);
        if (fileType === undefined) {
            SnackBarController.showMessage('このファイルは読み込むことができません', { type: 'error', clearAfterInMS: 5000 });
            return;
        }

        const newObjects: BaseObject[] = [];
        const currentTimeInMS = this.previewController.currentTimeInMS;
        const fileCategory = fileType.mime.split('/')[0];
        switch (fileCategory) {
            case 'video': {
                const { width, height } = await getVideoSize(filePath);
                newObjects.push(
                    new VideoObject({
                        startInMS: currentTimeInMS,
                        endInMS: currentTimeInMS + 5000,
                        srcFilePath: filePath,
                        width: AnimatableValue.constant(Math.round((200 * width) / height), AnimatableValueType.Numeric),
                        height: AnimatableValue.constant(200, AnimatableValueType.Numeric),
                    })
                );
                break;
            }

            case 'image': {
                const { width, height } = await getImageSize(filePath);
                newObjects.push(
                    new ImageObject({
                        startInMS: currentTimeInMS,
                        endInMS: currentTimeInMS + 5000,
                        srcFilePath: filePath,
                        width: AnimatableValue.constant(Math.round((200 * width) / height), AnimatableValueType.Numeric),
                        height: AnimatableValue.constant(200, AnimatableValueType.Numeric),
                    })
                );
                break;
            }

            case 'audio': {
                newObjects.push(
                    new AudioObject({
                        startInMS: currentTimeInMS,
                        endInMS: currentTimeInMS + 5000,
                        srcFilePath: filePath,
                    })
                );
                break;
            }

            default:
                SnackBarController.showMessage('このファイルは読み込むことができません', { type: 'error', clearAfterInMS: 5000 });
                return;
        }

        this.commitHistory(() => {
            this.addObject(...newObjects);
        });
    };

    modifySelectedObjects = (modifier: (object: BaseObject) => BaseObject | null, commitHistory = true): void => {
        const newObjects: BaseObject[] = [...this.selectedObjects].map(modifier).filter(isNonNull);

        if (commitHistory && newObjects.length > 0) {
            this.commitHistory(() => {
                for (const object of newObjects) {
                    this.updateObject(object);
                }
            });
        } else {
            for (const object of newObjects) {
                this.updateObject(object);
            }
        }
    };

    private getState = (): AppState => {
        return {
            previewTimeInMS: this.previewController.currentTimeInMS,
            project: this.project,
            selectedObjectIds: this.selectedObjectIds,
        };
    };

    private restoreFromState(state: AppState): void {
        this.setProject(state.project);
        this._selectedObjectIds = state.selectedObjectIds;
        this.previewController.currentTimeInMS = state.previewTimeInMS;
    }
}
