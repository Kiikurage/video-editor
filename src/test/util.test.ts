import { advanceDateNow, fixDateNow } from './util';

describe('fixDateNow', () => {
    it('Should fix Date.now() to the specified time', () => {
        fixDateNow(123456);
        expect(Date.now()).toBe(123456);
    });

    it('Should fix Date.now() to 0 as default', () => {
        fixDateNow();
        expect(Date.now()).toBe(0);
    });
});

describe('advanceDateNow', () => {
    it('Should advance Date.now() in the specified duration', () => {
        fixDateNow(12345);
        advanceDateNow(678);
        expect(Date.now()).toBe(12345 + 678);
    });
});
