import { Timer } from './Timer';

function sleep(timeInMS: number): Promise<void> {
    return new Promise((r) => setTimeout(r, timeInMS));
}

const EPS = 1000 / 60;

it('Should return current time when timer is running', async () => {
    const timer = new Timer();

    timer.start();
    await sleep(1000);
    const t1 = timer.currentTimeInMS;
    await sleep(1000);
    const t2 = timer.currentTimeInMS;

    expect(t1).toBeGreaterThanOrEqual(1000 - EPS);
    expect(t1).toBeLessThan(1000 + EPS);

    expect(t2).toBeGreaterThanOrEqual(2000 - EPS);
    expect(t2).toBeLessThan(2000 + EPS);
});

it('Should be stopped by stop()', async () => {
    const timer = new Timer();

    timer.start();
    await sleep(1000);
    timer.stop();
    const t1 = timer.currentTimeInMS;
    await sleep(1000);
    const t2 = timer.currentTimeInMS;

    expect(t1).toBeGreaterThanOrEqual(1000 - EPS);
    expect(t1).toBeLessThan(1000 + EPS);

    expect(t2).toBe(t1);
});

it('Should be able to seek when timer is stopped', async () => {
    const timer = new Timer();

    timer.seek(3000);
    const t1 = timer.currentTimeInMS;
    expect(t1).toBe(3000);

    timer.start();
    await sleep(1000);
    const t2 = timer.currentTimeInMS;

    expect(t2).toBeGreaterThanOrEqual(4000 - EPS);
    expect(t2).toBeLessThan(4000 + EPS);
});

it('Should be able to seek when timer is running', async () => {
    const timer = new Timer();

    timer.start();
    await sleep(1000);
    const t1 = timer.currentTimeInMS;
    timer.seek(3000);
    const t2 = timer.currentTimeInMS;
    await sleep(1000);
    const t3 = timer.currentTimeInMS;

    expect(t1).toBeGreaterThanOrEqual(1000 - EPS);
    expect(t1).toBeLessThan(1000 + EPS);

    expect(t2).toBeGreaterThanOrEqual(3000 - EPS);
    expect(t2).toBeLessThan(3000 + EPS);

    expect(t3).toBeGreaterThanOrEqual(4000 - EPS);
    expect(t3).toBeLessThan(4000 + EPS);
});
