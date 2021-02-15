import { useEffect } from 'react';
import { SnackBarController, SnackBarMessage } from '../../service/SnackBarController';
import { useForceUpdate } from './useForceUpdate';

export function useSnackBarController(): SnackBarMessage[] {
    const forceUpdate = useForceUpdate();
    const controller = SnackBarController.getInstance();

    useEffect(() => {
        controller.on('change', forceUpdate);

        return () => {
            controller.off('change', forceUpdate);
        };
    }, [controller, forceUpdate]);

    return controller.getMessages();
}
