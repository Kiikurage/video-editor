import { EventEmitter } from 'events';
import { TypedEventEmitter } from '../model/EventEmitterEvents';
import { Timer } from './Timer';

type PreviewPlayerControllerEventEmitter = TypedEventEmitter<{
    play: () => void;
    pause: () => void;
    seek: () => void;
    tick: () => void;
}>;

export class PreviewPlayerController extends (EventEmitter as PreviewPlayerControllerEventEmitter) {
    private readonly timer: Timer = new Timer();

    constructor() {
        super();

        this.timer.on('play', this.onTimerPlay);
        this.timer.on('seek', this.onTimerSeek);
        this.timer.on('tick', this.onTimerTick);
        this.timer.on('pause', this.onTimerPause);
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
}
