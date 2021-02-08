import { EventEmitterEvents } from '../model/EventEmitterEvents';
import { Timer } from './Timer';
import { EventEmitter } from 'events';

type PreviewControllerEvents = EventEmitterEvents<{
    play: void;
    pause: void;
    seek: void;
    tick: void;
}>;

export class PreviewController extends EventEmitter implements PreviewControllerEvents {
    private readonly timer: Timer = new Timer();

    constructor() {
        super();

        this.timer.on('seek', this.onTimerSeek);
        this.timer.on('tick', this.onTimerTick);
    }

    private onTimerTick = () => {
        this.emit('tick');
    };

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
        if (!this.paused) return;

        this.timer.start();
        this.emit('play');
    }

    pause(): void {
        if (this.paused) return;

        this.timer.stop();
        this.emit('pause');
    }
}
