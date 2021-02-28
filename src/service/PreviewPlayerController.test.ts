import { advanceDateNow, fixDateNow } from '../test/util';
import { PreviewPlayerController } from './PreviewPlayerController';

describe('currentTimeInMS', () => {
    it('Should be able to get and set', () => {
        const controller = new PreviewPlayerController();

        expect(controller.currentTimeInMS).toBe(0);
        controller.currentTimeInMS = 1234;
        expect(controller.currentTimeInMS).toBe(1234);
    });

    it("Should be changed when it's running", () => {
        const controller = new PreviewPlayerController();

        fixDateNow();
        expect(controller.currentTimeInMS).toBe(0);

        controller.play();
        advanceDateNow(1000);

        expect(controller.currentTimeInMS).toBe(1000);
    });

    it("Should be able to set when it's running", () => {
        const controller = new PreviewPlayerController();

        fixDateNow();
        expect(controller.currentTimeInMS).toBe(0);

        controller.play();
        advanceDateNow(1000);

        expect(controller.currentTimeInMS).toBe(1000);

        controller.currentTimeInMS = 2000;
        expect(controller.currentTimeInMS).toBe(2000);

        advanceDateNow(1000);
        expect(controller.currentTimeInMS).toBe(3000);
    });
});

describe('durationInMS', () => {
    it('Should be 3*1000 as default', () => {
        const controller = new PreviewPlayerController();
        expect(controller.durationInMS).toBe(3 * 1000);
    });

    it('Should be able to get and set', () => {
        const controller = new PreviewPlayerController();

        controller.durationInMS = 1234;
        expect(controller.durationInMS).toBe(1234);

        controller.durationInMS = 5678;
        expect(controller.durationInMS).toBe(5678);
    });
});

describe('paused', () => {
    it('Should be true in initial state', () => {
        const controller = new PreviewPlayerController();
        expect(controller.paused).toBe(true);
    });

    it('Should be false when playing', () => {
        const controller = new PreviewPlayerController();
        controller.play();
        expect(controller.paused).toBe(false);
    });

    it("Should be true when it's paused", () => {
        const controller = new PreviewPlayerController();
        controller.play();
        expect(controller.paused).toBe(false);

        controller.pause();
        expect(controller.paused).toBe(true);
    });

    it('Should be true when preview is done', () => {
        const controller = new PreviewPlayerController();
        fixDateNow();
        controller.durationInMS = 1000;

        controller.play();
        expect(controller.paused).toBe(false);

        advanceDateNow(2000);
        expect(controller.paused).toBe(true);
    });
});
