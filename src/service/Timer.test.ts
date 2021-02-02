import { advanceDateNow, fixDateNow } from '../test/util';
import { Timer } from './Timer';

it('Should return current time when timer is running', () => {
    const timer = new Timer();

    fixDateNow(0);
    timer.start();

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(1000);

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(2000);
});

it('Should be stopped by stop()', () => {
    const timer = new Timer();

    fixDateNow(0);
    timer.start();

    advanceDateNow(1000);
    timer.stop();
    expect(timer.currentTimeInMS).toBe(1000);

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(1000);
});

it('Should be able to seek when timer is stopped', () => {
    fixDateNow(0);
    const timer = new Timer();

    timer.seek(3000);
    const t1 = timer.currentTimeInMS;
    expect(t1).toBe(3000);

    timer.start();

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(4000);
});

it('Should be able to seek when timer is running', () => {
    fixDateNow(0);
    const timer = new Timer();

    timer.start();

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(1000);

    timer.seek(3000);
    expect(timer.currentTimeInMS).toBe(3000);

    advanceDateNow(1000);
    expect(timer.currentTimeInMS).toBe(4000);
});
