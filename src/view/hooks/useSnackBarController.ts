import { useEffect } from 'react';
import { SnackBarController, SnackBarMessage } from '../../service/SnackBarController';
import { useThrottledForceUpdate } from './useThrottledForceUpdate';

export function useSnackBarController(): SnackBarMessage[] {
    const forceUpdate = useThrottledForceUpdate();
    const controller = SnackBarController.getInstance();

    useEffect(() => {
        controller.on('change', forceUpdate);

        return () => {
            controller.off('change', forceUpdate);
        };
    }, [controller, forceUpdate]);

    return controller.getMessages();
}
