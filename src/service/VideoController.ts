const SEEK_EVENT = new Event('seek');

if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
    console.error('UnsupportedError: HTMLVideoElement#requestVideoFrameCallback is not supported in this browser.');
}

interface VideoControllerEvents {
    addEventListener(type: 'seek', listener: () => void): void;

    removeEventListener(type: 'seek', listener: () => void): void;
}

export class VideoController extends EventTarget implements VideoControllerEvents {
    private _video: HTMLVideoElement | null = null;

    get video(): HTMLVideoElement | null {
        return this._video;
    }

    get currentTimeInMS(): number {
        return (this.video?.currentTime ?? 0) * 1000;
    }

    set currentTimeInMS(newValue: number) {
        if (this.video) {
            this.video.currentTime = newValue / 1000;
        }
    }

    get videoWidth(): number {
        return this.video?.videoWidth ?? 0;
    }

    get videoHeight(): number {
        return this.video?.videoHeight ?? 0;
    }

    get durationInMS(): number {
        const duration = (this.video?.duration ?? 0) * 1000;
        return isNaN(duration) ? 0 : duration;
    }

    setVideo(video: HTMLVideoElement | null): void {
        this.cleanUpEventHandlers();
        this._video = video;
        this.initializeEventHandlers();
    }

    play(): void {
        void this.video?.play();
    }

    pause(): void {
        this.video?.pause();
    }

    private onVideoPlay = () => {
        this.video?.requestVideoFrameCallback(this.onRequestVideoFrameCallback);
    };

    private onVideoSeek = () => {
        this.dispatchEvent(SEEK_EVENT);
    };

    private onRequestVideoFrameCallback = () => {
        if (!this.video || this.video.paused) return;

        this.dispatchEvent(SEEK_EVENT);
        this.video.requestVideoFrameCallback(this.onRequestVideoFrameCallback);
    };

    private initializeEventHandlers() {
        this.video?.addEventListener('play', this.onVideoPlay);
        this.video?.addEventListener('seeking', this.onVideoSeek);
    }

    private cleanUpEventHandlers() {
        this.video?.removeEventListener('play', this.onVideoPlay);
        this.video?.removeEventListener('seeking', this.onVideoSeek);
    }
}
