import * as Mousetrap from 'mousetrap';
import * as React from 'react';
import { useEffect } from 'react';
import { AnimatableValue } from '../model/objects/AnimatableValue';
import { isResizable } from '../model/objects/ResizableObejct';
import { useAppController } from './AppControllerProvider';
import { AppShell } from './AppShell';
import { useCallbackRef } from './hooks/useCallbackRef';

export function App(): React.ReactElement {
    const appController = useAppController();

    const moveObjectUp = useCallbackRef(() => {
        appController.modifySelectedObjects((object) => {
            if (!isResizable(object)) return null;
            const clone = object.clone();

            clone.y = AnimatableValue.set(
                object.y,
                (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, appController.currentTimeInMS) - 10
            );
            return clone;
        });
    });

    const moveObjectDown = useCallbackRef(() => {
        appController.modifySelectedObjects((object) => {
            if (!isResizable(object)) return null;
            const clone = object.clone();

            clone.y = AnimatableValue.set(
                object.y,
                (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, appController.currentTimeInMS) + 10
            );
            return clone;
        });
    });

    const moveObjectLeft = useCallbackRef(() => {
        appController.modifySelectedObjects((object) => {
            if (!isResizable(object)) return null;
            const clone = object.clone();

            clone.x = AnimatableValue.set(
                object.x,
                (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, appController.currentTimeInMS) - 10
            );
            return clone;
        });
    });

    const moveObjectRight = useCallbackRef(() => {
        appController.modifySelectedObjects((object) => {
            if (!isResizable(object)) return null;
            const clone = object.clone();

            clone.x = AnimatableValue.set(
                object.x,
                (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, appController.currentTimeInMS) + 10
            );
            return clone;
        });
    });

    useEffect(() => {
        Mousetrap.bind('command+o', appController.openProject)
            .bind('command+s', appController.saveProject)
            .bind('command+shift+s', appController.saveAsNewProject)
            .bind('space', (ev) => {
                ev.preventDefault();
                appController.togglePlay();
            })
            .bind('backspace', () => {
                appController.commitHistory(() => {
                    appController.removeSelectedObjects();
                });
            })
            .bind('del', () => {
                appController.commitHistory(() => {
                    appController.removeSelectedObjects();
                });
            })
            .bind('esc', () => appController.setSelectedObjects([]))
            .bind('command+a', appController.selectAll)
            .bind('command+z', appController.undo)
            .bind('command+c', appController.copy)
            .bind('command+x', appController.cut)
            .bind('command+v', appController.paste)
            .bind('command+shift+z', appController.redo)
            .bind('up', moveObjectUp)
            .bind('down', moveObjectDown)
            .bind('left', moveObjectLeft)
            .bind('right', moveObjectRight);
    }, [appController, moveObjectDown, moveObjectLeft, moveObjectRight, moveObjectUp]);

    return <AppShell />;
}
