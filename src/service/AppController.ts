import { EventEmitter } from 'events';
import * as FileType from 'file-type';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { showSaveFileDialog } from '../ipc/renderer/showSaveFileDialog';
import { encodeProject } from '../lib/ffmpeg/FFMpegCommandBuilder';
import { assert } from '../lib/util';
import { UUID } from '../lib/UUID';
import { AppState } from '../model/AppState';
import { EventEmitterEvents } from '../model/EventEmitterEvents';
import { HistoryManager } from '../model/HistoryManager';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { ImageObject } from '../model/objects/ImageObject';
import { VideoObject } from '../model/objects/VideoObject';
import { Project } from '../model/Project';
import { PreviewController } from './PreviewController';
import { SnackBarController } from './SnackBarController';

type AppControllerEvents = EventEmitterEvents<{
    'project.open': void;
    'project.change': void;
    'object.select': void;
}>;

export class AppController extends EventEmitter implements AppControllerEvents {
    private readonly historyManager: HistoryManager<AppState>;
    private readonly _previewController = new PreviewController();

    constructor() {
        super();
        this.historyManager = new HistoryManager(this.getState);

        this.on('project.change', () => {
            this.previewController.durationInMS = Project.computeDurationInMS(this.project);
        });
    }

    private _selectedObjectId: string | null = null;

    get selectedObjectId(): string | null {
        return this._selectedObjectId;
    }

    private _project: Project = Project.EMPTY;

    get project(): Project {
        return this._project;
    }

    get previewController(): PreviewController {
        return this._previewController;
    }

    get selectedObject(): BaseObject | null {
        if (this.selectedObjectId === null) return null;

        return this.project.objects.find((object) => object.id === this.selectedObjectId) ?? null;
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

    addObject = (...objects: BaseObject[]): void => {
        this.setProject({
            ...this.project,
            objects: [...this.project.objects, ...objects],
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

        const snackBarMessageId = SnackBarController.showMessage('動画をエンコード中...');
        try {
            await encodeProject(project, './output.mp4');

            SnackBarController.clearMessage(snackBarMessageId);
            SnackBarController.showMessage('エンコードが完了しました', { type: 'success', clearAfterInMS: 3000 });
        } catch (err) {
            console.error('Failed to export video', err);

            SnackBarController.clearMessage(snackBarMessageId);
            SnackBarController.showMessage('エンコード中にエラーが発生しました', { type: 'error' });

            // TODO: クリーンアップされず永遠にゴミが残る
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
            case 'video':
                newObjects.push(
                    {
                        id: UUID(),
                        type: VideoObject.type,
                        x: 100,
                        y: 100,
                        width: 200,
                        height: 200,
                        startInMS: currentTimeInMS,
                        endInMS: currentTimeInMS + 5000,
                        srcFilePath: filePath,
                    } as VideoObject /* TODO: 音声ストリームも取り込む */
                );
                break;

            case 'image':
                newObjects.push({
                    id: UUID(),
                    type: ImageObject.type,
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 200,
                    startInMS: currentTimeInMS,
                    endInMS: currentTimeInMS + 5000,
                    srcFilePath: filePath,
                } as ImageObject);
                break;

            case 'audio':
                newObjects.push({
                    id: UUID(),
                    type: AudioObject.type,
                    startInMS: currentTimeInMS,
                    endInMS: currentTimeInMS + 5000,
                    srcFilePath: filePath,
                    volume: 0.5,
                } as AudioObject);
                break;

            default:
                SnackBarController.showMessage('このファイルは読み込むことができません', { type: 'error', clearAfterInMS: 5000 });
                return;
        }

        this.commitHistory(() => {
            this.addObject(...newObjects);
        });
    };

    private getState = (): AppState => {
        return {
            previewTimeInMS: this.previewController.currentTimeInMS,
            project: this.project,
            selectedObjectId: this.selectedObjectId,
        };
    };

    private restoreFromState(state: AppState): void {
        this.setProject(state.project);
        this.selectObject(state.selectedObjectId);
        this.previewController.currentTimeInMS = state.previewTimeInMS;
    }
}
