import { Timer } from './Timer';

const PLAY_EVENT = new Event('play');
const PAUSE_EVENT = new Event('pause');
const SEEK_EVENT = new Event('seek');

interface PreviewControllerEvents {
    addEventListener(type: 'play', listener: () => void): void;
    addEventListener(type: 'pause', listener: () => void): void;
    addEventListener(type: 'seek', listener: () => void): void;

    removeEventListener(type: 'play', listener: () => void): void;
    removeEventListener(type: 'pause', listener: () => void): void;
    removeEventListener(type: 'seek', listener: () => void): void;
}

export class PreviewController extends EventTarget implements PreviewControllerEvents {
    private readonly timer: Timer = new Timer();

    constructor() {
        super();

        this.timer.addEventListener('seek', this.onTimerSeek);
    }

    private onTimerSeek = () => {
        this.dispatchEvent(SEEK_EVENT);
    };

    get paused(): boolean {
        return this.timer.paused;
    }

    get durationInMS(): number {
        return this.timer.durationInMS;
    }

    get currentTimeInMS(): number {
        return this.timer.currentTimeInMS;
    }

    set currentTimeInMS(newValue: number) {
        this.timer.seek(newValue);
    }

    play(): void {
        void this.timer.start();
        this.dispatchEvent(PLAY_EVENT);
    }

    pause(): void {
        this.timer.stop();
        this.dispatchEvent(PAUSE_EVENT);
    }
}
