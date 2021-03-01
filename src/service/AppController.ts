import { EventEmitter } from 'events';
import { clipboard } from 'electron';
import * as FileType from 'file-type';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { showSaveFileDialog } from '../ipc/renderer/showSaveFileDialog';
import { emptySet } from '../lib/emptySet';
import { encodeProject } from '../lib/ffmpeg/FFMpegCommandBuilder';
import { getImageSize, getVideoSize } from '../lib/getAssetSpacialSize';
import { isNonNull } from '../lib/isNonNull';
import { assert } from '../lib/util';
import { AppState } from '../model/AppState';
import { Box } from '../model/Box';
import { TypedEventEmitter } from '../model/EventEmitterEvents';
import { Frame } from '../model/frame/Frame';
import { HistoryManager } from '../model/HistoryManager';
import { AnimatableValue, AnimatableValueType } from '../model/objects/AnimatableValue';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { ImageObject } from '../model/objects/ImageObject';
import { ObjectParser } from '../model/objects/ObjectParser';
import { VideoObject } from '../model/objects/VideoObject';
import { Project } from '../model/Project';
import { SnackBarController } from './SnackBarController';
import { Timer } from './Timer';

type AppControllerEventEmitter = TypedEventEmitter<{
    open: (newProject: Project) => void;
    change: () => void;
    selectionchange: (addedObjectIds: ReadonlySet<string>, removedObjectIds: ReadonlySet<string>) => void;
    play: () => void;
    pause: () => void;
    seek: () => void;
    tick: () => void;
}>;

export class AppController extends (EventEmitter as AppControllerEventEmitter) {
    private readonly historyManager: HistoryManager<AppState>;
    private readonly timer: Timer = new Timer();

    constructor() {
        super();
        this.historyManager = new HistoryManager(this.getState);

        this.timer.on('play', this.onTimerPlay);
        this.timer.on('seek', this.onTimerSeek);
        this.timer.on('tick', this.onTimerTick);
        this.timer.on('pause', this.onTimerPause);
    }

    private _selectedObjectIds: ReadonlySet<string> = new Set<string>();

    get selectedObjectIds(): ReadonlySet<string> {
        return this._selectedObjectIds;
    }

    private _project: Project = Project.create();

    get project(): Project {
        return this._project;
    }

    get paused(): boolean {
        return this.timer.paused;
    }

    get durationInMS(): number {
        return this.timer.durationInMS;
    }

    set durationInMS(newValue: number) {
        this.timer.durationInMS = newValue;
    }

    get currentTimeInMS(): number {
        return this.timer.currentTimeInMS;
    }

    set currentTimeInMS(newValue: number) {
        this.timer.seek(newValue);
    }

    get selectedObjects(): ReadonlySet<BaseObject> {
        return new Set(this.project.objects.filter((object) => this.selectedObjectIds.has(object.id)));
    }

    play(): void {
        if (!this.paused) return;

        if (this.currentTimeInMS >= this.durationInMS) {
            this.currentTimeInMS = 0;
        }

        this.timer.start();
    }

    pause(): void {
        if (this.paused) return;

        this.timer.stop();
    }

    togglePlay(): void {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    setProject = (newValue: Project): void => {
        this._project = newValue;
        this.durationInMS = Project.computeDurationInMS(newValue);
        this.emit('change');
    };

    addObjectToSelection = (id: string): void => {
        if (this._selectedObjectIds.has(id)) return;

        this._selectedObjectIds = new Set([...this._selectedObjectIds, id]);
        this.emit('selectionchange', new Set([id]), emptySet());
    };

    removeObjectFromSelection = (id: string): void => {
        if (!this._selectedObjectIds.has(id)) return;

        const newSelectedObjectIds = new Set(this._selectedObjectIds);
        newSelectedObjectIds.delete(id);

        this._selectedObjectIds = newSelectedObjectIds;
        this.emit('selectionchange', emptySet(), new Set([id]));
    };

    setSelectedObjects = (newIds: string[]): void => {
        const oldIds = this.selectedObjectIds;
        this._selectedObjectIds = new Set(newIds);

        const addedObjectIds = new Set<string>(newIds);
        const removedObjectIds = new Set<string>(oldIds);

        for (const oldId of removedObjectIds) {
            if (addedObjectIds.has(oldId)) {
                addedObjectIds.delete(oldId);
                removedObjectIds.delete(oldId);
            }
        }
        for (const newId of addedObjectIds) {
            if (addedObjectIds.has(newId)) {
                addedObjectIds.delete(newId);
                removedObjectIds.delete(newId);
            }
        }
        this.emit('selectionchange', addedObjectIds, removedObjectIds);
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
        this.emit('open', newProject);
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

    getFrames(): Frame[] {
        const timeInMS = this.currentTimeInMS;
        return this.project.objects
            .filter((object) => object.startInMS <= timeInMS && timeInMS < object.endInMS)
            .map((object) => object.getFrame(timeInMS));
    }

    getSelectedFrames(): Frame[] {
        const selectedFrames: Frame[] = [];
        for (const frame of this.getFrames()) {
            if (this.selectedObjectIds.has(frame.id)) {
                selectedFrames.push(frame);
            }
        }
        return selectedFrames;
    }

    getNonSelectedFrames(): Frame[] {
        const nonSelectedFrames: Frame[] = [];
        for (const frame of this.getFrames()) {
            if (!this.selectedObjectIds.has(frame.id)) {
                nonSelectedFrames.push(frame);
            }
        }
        return nonSelectedFrames;
    }

    getSelectionBox(): Box | null {
        const selectedFrames = this.getSelectedFrames();
        if (selectedFrames.length === 0) {
            return null;
        } else {
            const x1 = Math.min(...selectedFrames.map((frame) => frame.x));
            const y1 = Math.min(...selectedFrames.map((frame) => frame.y));
            const x2 = Math.max(...selectedFrames.map((frame) => frame.x + frame.width));
            const y2 = Math.max(...selectedFrames.map((frame) => frame.y + frame.height));
            return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
        }
    }

    commitHistory = (fn: () => void): void => {
        this.historyManager.commit(fn);
    };

    importAssetFromFile = async (filePath: string): Promise<void> => {
        const fileType = await FileType.fromFile(filePath);
        if (fileType === undefined) {
            SnackBarController.showMessage('このファイルは読み込むことができません', { type: 'error', clearAfterInMS: 5000 });
            return;
        }

        let newObject: BaseObject;
        const fileCategory = fileType.mime.split('/')[0];
        switch (fileCategory) {
            case 'video': {
                const { width, height } = await getVideoSize(filePath);
                newObject = new VideoObject({
                    startInMS: 0,
                    endInMS: 5000,
                    srcFilePath: filePath,
                    width: AnimatableValue.constant(Math.round((200 * width) / height), AnimatableValueType.Numeric),
                    height: AnimatableValue.constant(200, AnimatableValueType.Numeric),
                });
                break;
            }

            case 'image': {
                const { width, height } = await getImageSize(filePath);
                newObject = new ImageObject({
                    startInMS: 0,
                    endInMS: 5000,
                    srcFilePath: filePath,
                    width: AnimatableValue.constant(Math.round((200 * width) / height), AnimatableValueType.Numeric),
                    height: AnimatableValue.constant(200, AnimatableValueType.Numeric),
                });
                break;
            }

            case 'audio': {
                newObject = new AudioObject({
                    startInMS: 0,
                    endInMS: 5000,
                    srcFilePath: filePath,
                });
                break;
            }

            default:
                SnackBarController.showMessage('このファイルは読み込むことができません', { type: 'error', clearAfterInMS: 5000 });
                return;
        }

        if (newObject !== null) {
            this.commitHistory(() => {
                this.addObject(
                    newObject.clone({
                        startInMS: this.currentTimeInMS,
                        endInMS: this.currentTimeInMS + 5000,
                    })
                );
            });
        }
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

    private onTimerPlay = () => {
        this.emit('play');
    };

    private onTimerTick = () => {
        this.emit('tick');
    };

    private onTimerSeek = () => {
        this.emit('seek');
    };

    private onTimerPause = () => {
        this.emit('pause');
    };

    private getState = (): AppState => {
        return {
            previewTimeInMS: this.currentTimeInMS,
            project: this.project,
            selectedObjectIds: this.selectedObjectIds,
        };
    };

    private restoreFromState(state: AppState): void {
        this.setProject(state.project);
        this._selectedObjectIds = state.selectedObjectIds;
        this.currentTimeInMS = state.previewTimeInMS;
    }
}
