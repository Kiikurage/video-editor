import { range } from './range';
import { UUID } from './UUID';

describe('UUID', () => {
    it('Generated value should be unique from others', () => {
        const N = 1e5;

        const uuids = new Set(range(N).map(UUID));
        expect(uuids.size).toBe(N);
    });
});
