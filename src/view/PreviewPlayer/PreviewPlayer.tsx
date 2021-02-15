import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Stage } from 'react-pixi-fiber';
import styled from 'styled-components';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
import { BaseObject } from '../../model/objects/BaseObject';
import { Box } from '../../model/objects/Box';
import { ImageObject } from '../../model/objects/ImageObject';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TextObject } from '../../model/objects/TextObject';
import { VideoObject } from '../../model/objects/VideoObject';
import { useAppController } from '../AppControllerProvider';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { AudioObjectView } from './AudioObjectView';
import { Background } from './Background';
import { ImageObjectView } from './ImageObjectView';
import { ResizableObject } from './ResizeView/ResizableObejct';
import { ShapeObjectView } from './ShapeObjectView';
import { TextObjectView } from './TextObjectView';
import { VideoObjectView } from './VideoObjectView';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: #e0e0e0;
    display: grid;
    grid-template:
        'pad1 pad2 pad3' minmax(0, 1fr)
        'pad4 main pad5' max-content
        'pad6 pad7 pad8' minmax(0, 1fr) / minmax(0, 1fr) max-content minmax(0, 1fr);
    overflow-x: auto;
    overflow-y: auto;
    box-sizing: border-box;
    border: 1px solid transparent;
`;

const ContentWrapper = styled.div`
    grid-area: main;
    padding: 16px;
    border: 1px solid transparent;
    z-index: 0;
`;

const Shadow = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.05);
    z-index: 1;
    pointer-events: none;
    user-select: none;
`;

const ContentBase = styled.div`
    position: relative;
    background: #fff;
    box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    flex: 0 0 auto;

    > canvas {
        position: relative;
        width: 100% !important;
        height: 100% !important;
    }
`;

export function PreviewPlayer(): React.ReactElement {
    const appController = useAppController();
    const { previewController, project, selectedObjects } = appController;

    const forceUpdate = useForceUpdate();
    useEffect(() => {
        appController.on('project.change', forceUpdate);
        appController.on('object.select', forceUpdate);

        return () => {
            appController.off('project.change', forceUpdate);
            appController.off('object.select', forceUpdate);
        };
    }, [appController, forceUpdate]);

    useEffect(() => {
        previewController.on('seek', forceUpdate);
        previewController.on('tick', forceUpdate);

        return () => {
            previewController.off('seek', forceUpdate);
            previewController.off('tick', forceUpdate);
        };
    }, [previewController, forceUpdate]);

    const contentBaseWidth = 640;
    const contentBaseHeight = (contentBaseWidth * project.viewport.height) / project.viewport.width;

    const pixiStageOption = useMemo(() => {
        return {
            backgroundColor: 0xffffff,
            width: project.viewport.width,
            height: project.viewport.height,
        };
    }, [project.viewport.height, project.viewport.width]);

    const currentTimeInMS = previewController.currentTimeInMS;

    const activeObjects = project.objects.filter(
        (object) => AudioObject.isAudio(object) || (object.startInMS <= currentTimeInMS && currentTimeInMS <= object.endInMS)
    );

    const onObjectChange = useCallbackRef((object: ResizableObject, x: number, y: number, width: number, height: number) => {
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject: ResizableObject = {
                ...object,
                x: AnimatableValue.set(object.x, newFrameTiming, x),
                y: AnimatableValue.set(object.y, newFrameTiming, y),
                width: AnimatableValue.set(object.width, newFrameTiming, width),
                height: AnimatableValue.set(object.height, newFrameTiming, height),
            };
            appController.updateObject(newObject);
        });
    });

    function renderObjectView(object: BaseObject, snapPositionXsBase: number[], snapPositionYsBase: number[]): React.ReactNode {
        const isSelected = selectedObjects.has(object);

        const snapPositionXs = snapPositionXsBase.slice();
        const snapPositionYs = snapPositionYsBase.slice();
        if (Box.isBox(object)) {
            for (const targetX of [object.x, object.x + object.width]) {
                const i = snapPositionXs.indexOf(targetX);
                if (i === -1) continue;

                snapPositionXs.splice(i, 1);
            }
            for (const targetY of [object.y, object.y + object.height]) {
                const i = snapPositionYs.indexOf(targetY);
                if (i === -1) continue;

                snapPositionYs.splice(i, 1);
            }
        }

        switch (object.type) {
            case VideoObject.type:
                return (
                    <VideoObjectView
                        key={object.id}
                        video={object as VideoObject}
                        previewController={previewController}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={(ev) => {
                            if (ev.data.originalEvent.shiftKey) {
                                appController.addObjectToSelection(object.id);
                            } else {
                                appController.setSelectedObjects([object.id]);
                            }
                        }}
                        onObjectChange={onObjectChange}
                    />
                );

            case TextObject.type:
                return (
                    <TextObjectView
                        key={object.id}
                        textObject={object as TextObject}
                        previewController={previewController}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={(ev) => {
                            if (ev.data.originalEvent.shiftKey) {
                                appController.addObjectToSelection(object.id);
                            } else {
                                appController.setSelectedObjects([object.id]);
                            }
                        }}
                        onObjectChange={onObjectChange}
                    />
                );

            case ImageObject.type:
                return (
                    <ImageObjectView
                        key={object.id}
                        image={object as ImageObject}
                        previewController={previewController}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={(ev) => {
                            if (ev.data.originalEvent.shiftKey) {
                                appController.addObjectToSelection(object.id);
                            } else {
                                appController.setSelectedObjects([object.id]);
                            }
                        }}
                        onObjectChange={onObjectChange}
                    />
                );

            case ShapeObject.type:
                return (
                    <ShapeObjectView
                        key={object.id}
                        previewController={previewController}
                        shape={object as ShapeObject}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={(ev) => {
                            if (ev.data.originalEvent.shiftKey) {
                                appController.addObjectToSelection(object.id);
                            } else {
                                appController.setSelectedObjects([object.id]);
                            }
                        }}
                        onObjectChange={onObjectChange}
                    />
                );

            case AudioObject.type:
                return <AudioObjectView key={object.id} audio={object as AudioObject} previewController={previewController} />;

            default:
                console.warn(`Unknown object type: ${object.type}`);
                return undefined;
        }
    }

    const onBaseClick = useCallbackRef(() => {
        appController.setSelectedObjects([]);
    });

    const onContentBaseClick = useCallbackRef((ev: React.MouseEvent) => {
        ev.stopPropagation();
    });

    const onBackgroundClick = useCallbackRef(() => {
        appController.setSelectedObjects([]);
    });

    // const boxFrames = activeObjects
    //     .filter(Box.isBox)
    //     .map((object) => {
    //         return {
    //             x: AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, previewController.currentTimeInMS),
    //             y: AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, previewController.currentTimeInMS),
    //             width: AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, previewController.currentTimeInMS),
    //             height: AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, previewController.currentTimeInMS),
    //         };
    //     })
    //     .filter(isNonNull);
    //
    //
    // const snapPositionXsBase = [0, project.viewport.width, ...boxFrames.map((frame) => [frame.x, frame.x + frame.width]).flat()];
    // const snapPositionYsBase = [0, project.viewport.height, ...boxFrames.map((frame) => [frame.y, frame.y + frame.height]).flat()];
    const snapPositionXsBase: number[] = [];
    const snapPositionYsBase: number[] = [];
    return (
        <Base onClick={onBaseClick}>
            <ContentWrapper>
                <ContentBase style={{ width: contentBaseWidth, height: contentBaseHeight }} onClick={onContentBaseClick}>
                    <Stage options={pixiStageOption}>
                        <Background width={project.viewport.width} height={project.viewport.height} onClick={onBackgroundClick} />
                        {activeObjects.map((object) => renderObjectView(object, snapPositionXsBase, snapPositionYsBase))}
                    </Stage>
                </ContentBase>
            </ContentWrapper>
            <Shadow />
        </Base>
    );
}
