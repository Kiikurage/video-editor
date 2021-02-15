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
        Mousetrap.bind('space', (ev) => {
            ev.preventDefault();
            appController.togglePreviewPlay();
        });
        Mousetrap.bind('backspace', () => {
            appController.commitHistory(() => {
                appController.removeSelectedObject();
            });
        });
        Mousetrap.bind('del', () => {
            appController.commitHistory(() => {
                appController.removeSelectedObject();
            });
        });
        Mousetrap.bind('esc', () => appController.setSelectedObjects([]));
        Mousetrap.bind('command+z', appController.undo);
        Mousetrap.bind('command+shift+z', appController.redo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AppShell />;
}
