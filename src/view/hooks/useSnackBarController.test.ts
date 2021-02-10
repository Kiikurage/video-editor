import { act, renderHook } from '@testing-library/react-hooks';
import { SnackBarController } from '../../service/SnackBarController';
import { useSnackBarController } from './useSnackBarController';

it('Should return the messages', () => {
    const hook = renderHook(() => useSnackBarController());

    const messages1 = hook.result.current;
    expect(messages1).toEqual([]);

    act(() => {
        SnackBarController.showMessage('TestMessage');
    });

    const messages2 = hook.result.current;
    expect(messages2).toEqual([
        {
            id: expect.anything() as number,
            text: 'TestMessage',
            type: 'info',
            clearAfterInMS: -1,
        },
    ]);
});
