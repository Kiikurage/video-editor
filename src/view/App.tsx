import * as Mousetrap from 'mousetrap';
import * as React from 'react';
import { useEffect } from 'react';
import { AnimatableValue } from '../model/objects/AnimatableValue';
import { useAppController } from './AppControllerProvider';
import { AppShell } from './AppShell';
import { isResizable } from './PreviewPlayer/ResizeView/ResizableObejct';

export function App(): React.ReactElement {
    const appController = useAppController();

    useEffect(() => {
        Mousetrap.bind('command+o', appController.openProject)
            .bind('command+s', appController.saveProject)
            .bind('command+shift+s', appController.saveAsNewProject)
            .bind('space', (ev) => {
                ev.preventDefault();
                appController.togglePreviewPlay();
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
            .bind('up', () => {
                appController.modifySelectedObjects((object) => {
                    if (!isResizable(object)) return null;

                    return {
                        ...object,
                        y: AnimatableValue.set(
                            object.y,
                            (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                            AnimatableValue.interpolate(
                                object.y,
                                object.startInMS,
                                object.endInMS,
                                appController.previewController.currentTimeInMS
                            ) - 10
                        ),
                    };
                });
            })
            .bind('down', () => {
                appController.modifySelectedObjects((object) => {
                    if (!isResizable(object)) return null;

                    return {
                        ...object,
                        y: AnimatableValue.set(
                            object.y,
                            (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                            AnimatableValue.interpolate(
                                object.y,
                                object.startInMS,
                                object.endInMS,
                                appController.previewController.currentTimeInMS
                            ) + 10
                        ),
                    };
                });
            })
            .bind('left', () => {
                appController.modifySelectedObjects((object) => {
                    if (!isResizable(object)) return null;

                    return {
                        ...object,
                        x: AnimatableValue.set(
                            object.x,
                            (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                            AnimatableValue.interpolate(
                                object.x,
                                object.startInMS,
                                object.endInMS,
                                appController.previewController.currentTimeInMS
                            ) - 10
                        ),
                    };
                });
            })
            .bind('right', () => {
                appController.modifySelectedObjects((object) => {
                    if (!isResizable(object)) return null;

                    return {
                        ...object,
                        x: AnimatableValue.set(
                            object.x,
                            (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS),
                            AnimatableValue.interpolate(
                                object.x,
                                object.startInMS,
                                object.endInMS,
                                appController.previewController.currentTimeInMS
                            ) + 10
                        ),
                    };
                });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AppShell />;
}
