import { EventEmitter } from 'events';
import { EventEmitterEvents } from '../model/EventEmitterEvents';

type TimerEvents = EventEmitterEvents<{
    seek: void;
}>;

export class Timer extends EventEmitter implements TimerEvents {
    public durationInMS: number = 60 * 1000;

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
    }

    stop(): void {
        if (!this.isStarted) return;

        this.lastPausedPositionInMS = this.currentTimeInMS;
        this.isStarted = false;
    }

    seek(timeInMS: number): void {
        if (timeInMS < 0) timeInMS = 0;
        if (timeInMS > this.durationInMS) timeInMS = this.durationInMS;

        if (this.isStarted) {
            this.startedFromInMS = timeInMS;
            this.startedAtInMS = Date.now();
        } else {
            if (this.lastPausedPositionInMS === timeInMS) return;

            this.lastPausedPositionInMS = timeInMS;
            this.emit('seek');
        }
    }

    private mainLoop = () => {
        if (!this.isStarted) return;

        this.emit('seek');
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
