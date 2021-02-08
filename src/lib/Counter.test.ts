import { Counter } from './Counter';

it('basic usage', () => {
    const counter = new Counter();

    expect(counter.getAndInc()).toBe(1);
    expect(counter.getAndInc()).toBe(2);
    expect(counter.getAndInc()).toBe(3);
});
