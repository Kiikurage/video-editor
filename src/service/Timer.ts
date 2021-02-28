import { EventEmitter } from 'events';
import { TypedEventEmitter } from '../model/EventEmitterEvents';

type TimerEventEmitter = TypedEventEmitter<{
    play: () => void;
    tick: () => void;
    seek: () => void;
    pause: () => void;
}>;

export class Timer extends (EventEmitter as TimerEventEmitter) {
    public durationInMS: number = 3 * 1000;

    private isStarted = false;
    private startedAtInMS = 0;
    private startedFromInMS = 0;
    private lastPausedPositionInMS = 0;

    private mainLoopTimerId: number | null = null;

    get paused(): boolean {
        return !this.isStarted || Date.now() - this.startedAtInMS > this.durationInMS;
    }

    get currentTimeInMS(): number {
        if (this.isStarted) {
            const elapsedTime = Date.now() - this.startedAtInMS;
            return Math.min(Math.max(0, this.startedFromInMS + elapsedTime), this.durationInMS);
        } else {
            return this.lastPausedPositionInMS;
        }
    }

    start(): void {
        if (this.isStarted) return;

        this.startedAtInMS = Date.now();
        this.startedFromInMS = this.lastPausedPositionInMS;
        this.isStarted = true;

        this.runMainLoop();
        this.emit('play');
    }

    stop(): void {
        if (!this.isStarted) return;

        this.lastPausedPositionInMS = this.currentTimeInMS;
        this.isStarted = false;
        this.emit('pause');
    }

    seek(timeInMS: number): void {
        if (this.isStarted) {
            this.startedFromInMS = timeInMS;
            this.startedAtInMS = Date.now();
        } else {
            if (this.lastPausedPositionInMS === timeInMS) return;

            this.lastPausedPositionInMS = timeInMS;
        }
        this.emit('seek');
    }

    private mainLoop = () => {
        if (!this.isStarted) return;

        this.emit('tick');
        if (this.currentTimeInMS === this.durationInMS) {
            this.stop();
            return;
        }

        this.mainLoopTimerId = requestAnimationFrame(this.mainLoop);
    };

    private runMainLoop() {
        if (this.mainLoopTimerId !== null) {
            cancelAnimationFrame(this.mainLoopTimerId);
            this.mainLoopTimerId = null;
        }

        this.mainLoopTimerId = requestAnimationFrame(this.mainLoop);
    }
}
