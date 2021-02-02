import { Timer } from './Timer';
import { EventEmitter } from 'events';

interface PreviewControllerEvents {
    on(type: 'pause', listener: () => void): void;
    on(type: 'seek', listener: () => void): void;

    off(type: 'pause', listener: () => void): void;
    off(type: 'seek', listener: () => void): void;
}

export class PreviewController extends EventEmitter implements PreviewControllerEvents {
    private readonly timer: Timer = new Timer();

    constructor() {
        super();

        this.timer.on('seek', this.onTimerSeek);
    }

    private onTimerSeek = () => {
        this.emit('seek');
    };

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

    play(): void {
        this.timer.start();
    }

    pause(): void {
        this.timer.stop();
        this.emit('pause');
    }
}
