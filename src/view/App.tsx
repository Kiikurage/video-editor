import * as Mousetrap from 'mousetrap';
import * as React from 'react';
import { useEffect } from 'react';
import { useAppController } from './AppControllerProvider';
import { AppShell } from './AppShell';

export function App(): React.ReactElement {
    const appController = useAppController();

    useEffect(() => {
        Mousetrap.bind('command+o', appController.openProject);
        Mousetrap.bind('command+s', appController.saveProject);
        Mousetrap.bind('command+shift+s', appController.saveAsNewProject);
        Mousetrap.bind('space', appController.togglePreviewPlay);
        Mousetrap.bind('backspace', appController.removeSelectedObject);
        Mousetrap.bind('del', appController.removeSelectedObject);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AppShell />;
}
