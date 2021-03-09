import { AppController } from './AppController';
import { SnapPoint1DService } from './SnapPoint1DService';

export class SnapPoint2DService {
    private readonly appController: AppController;
    private readonly xSnapPointService = new SnapPoint1DService();
    private readonly ySnapPointService = new SnapPoint1DService();

    constructor(appController: AppController) {
        this.appController = appController;
        appController.on('selectionchange', this.onAppControllerSelectionChange);
        appController.on('pause', this.onAppControllerPause);
        appController.on('change', this.onAppControllerChange);
    }

    checkX(x: number, windowSize: number): number | null {
        return this.xSnapPointService.check(x, windowSize);
    }

    checkY(y: number, windowSize: number): number | null {
        return this.ySnapPointService.check(y, windowSize);
    }

    getObjectsAtX(x: number): ReadonlySet<string> {
        return this.xSnapPointService.getObjectsAt(x);
    }

    getObjectsAtY(y: number): ReadonlySet<string> {
        return this.ySnapPointService.getObjectsAt(y);
    }

    private initialize(): void {
        this.xSnapPointService.clear();
        this.ySnapPointService.clear();
        for (const frame of this.appController.getNonSelectedFrames()) {
            this.xSnapPointService.add(frame.id, frame.x, frame.x + frame.width);
            this.ySnapPointService.add(frame.id, frame.y, frame.y + frame.height);
        }
        this.xSnapPointService.add('viewport', 0, this.appController.project.viewport.width);
        this.ySnapPointService.add('viewport', 0, this.appController.project.viewport.height);
    }

    private readonly onAppControllerSelectionChange = (addedObjectIds: ReadonlySet<string>, removedObjectIds: ReadonlySet<string>) => {
        for (const frame of this.appController.getNonSelectedFrames()) {
            if (!removedObjectIds.has(frame.id)) continue;
            this.xSnapPointService.add(frame.id, frame.x, frame.x + frame.width);
            this.ySnapPointService.add(frame.id, frame.y, frame.y + frame.height);
        }
        for (const objectId of addedObjectIds) {
            this.xSnapPointService.delete(objectId);
            this.ySnapPointService.delete(objectId);
        }
    };

    private readonly onAppControllerChange = () => {
        this.initialize();
    };

    private readonly onAppControllerPause = () => {
        this.initialize();
    };
}
