import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Stage } from 'react-pixi-fiber';
import styled from 'styled-components';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { ImageObject } from '../model/objects/ImageObject';
import { SizedObject } from '../model/objects/SizedObject';
import { VideoObject } from '../model/objects/VideoObject';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
import { AudioObjectView } from './pixi/PreviewPlayer/AudioObjectView';
import { Background } from './pixi/PreviewPlayer/Background';
import { CaptionObjectView } from './pixi/PreviewPlayer/CaptionObjectView';
import { ImageObjectView } from './pixi/PreviewPlayer/ImageObjectView';
import { VideoObjectView } from './pixi/PreviewPlayer/VideoObjectView';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: #e0e0e0;
    padding: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    overflow-x: auto;
    overflow-y: auto;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
`;

const ContentBase = styled.div`
    position: relative;
    background: #fff;
    box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

    > canvas {
        position: relative;
        width: 100% !important;
        height: 100% !important;
    }
`;

export function PreviewPlayer(): React.ReactElement {
    const appController = useAppController();
    const { previewController, project, selectedObject } = appController;

    const forceUpdate = useThrottledForceUpdate();
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
        (object) => AudioObject.isAudio(object) || (object.startInMS <= currentTimeInMS && currentTimeInMS < object.endInMS)
    );

    const onObjectChange = useCallbackRef((oldObject: BaseObject, newObject: BaseObject) => {
        appController.commitHistory(() => {
            appController.updateObject(newObject);
        });
    });

    function renderObjectView(object: BaseObject, snapPositionXsBase: number[], snapPositionYsBase: number[]): React.ReactNode {
        const isSelected = selectedObject === object;

        const snapPositionXs = snapPositionXsBase.slice();
        const snapPositionYs = snapPositionYsBase.slice();
        if (SizedObject.isSized(object)) {
            for (const targetX of [object.x, object.x + object.width]) {
                const i = snapPositionXs.indexOf(targetX);
                if (i === -1) continue;

                snapPositionXs.splice(i, i);
            }
            for (const targetY of [object.y, object.y + object.height]) {
                const i = snapPositionYs.indexOf(targetY);
                if (i === -1) continue;

                snapPositionYs.splice(i, i);
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
                        onSelect={() => appController.selectObject(object.id)}
                        onObjectChange={onObjectChange}
                    />
                );

            case CaptionObject.type:
                return (
                    <CaptionObjectView
                        key={object.id}
                        caption={object as CaptionObject}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={() => appController.selectObject(object.id)}
                        onObjectChange={onObjectChange}
                    />
                );

            case ImageObject.type:
                return (
                    <ImageObjectView
                        key={object.id}
                        image={object as ImageObject}
                        selected={isSelected}
                        snapPositionXs={snapPositionXs}
                        snapPositionYs={snapPositionYs}
                        onSelect={() => appController.selectObject(object.id)}
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

    const onBaseClick = useCallbackRef(() => appController.selectObject(null));

    const onContentBaseClick = useCallbackRef((ev: React.MouseEvent) => {
        ev.stopPropagation();
    });

    const onBackgroundClick = useCallbackRef(() => appController.selectObject(null));

    const sizedObjects = activeObjects.filter(SizedObject.isSized);

    const snapPositionXsBase = [0, project.viewport.width, ...sizedObjects.map((object) => [object.x, object.x + object.width]).flat()];
    const snapPositionYsBase = [0, project.viewport.height, ...sizedObjects.map((object) => [object.y, object.y + object.height]).flat()];

    return (
        <Base onClick={onBaseClick}>
            <ContentBase style={{ width: contentBaseWidth, height: contentBaseHeight }} onClick={onContentBaseClick}>
                <Stage options={pixiStageOption}>
                    <Background width={project.viewport.width} height={project.viewport.height} onClick={onBackgroundClick} />
                    {activeObjects.map((object) => renderObjectView(object, snapPositionXsBase, snapPositionYsBase))}
                </Stage>
            </ContentBase>
        </Base>
    );
}
