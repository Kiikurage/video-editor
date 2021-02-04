import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Stage } from 'react-pixi-fiber';
import styled from 'styled-components';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { ImageObject } from '../model/objects/ImageObject';
import { Project } from '../model/Project';
import { VideoObject } from '../model/objects/VideoObject';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
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

interface Props {
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onObjectSelect: (newObject: BaseObject | null) => void;
    onObjectChange: (oldValue: BaseObject, newValue: BaseObject) => void;
}

export function PreviewPlayer(props: Props): React.ReactElement {
    const { previewController, project, selectedObject, onObjectSelect, onObjectChange } = props;

    const forceUpdate = useThrottledForceUpdate();
    const onPreviewControllerSeek = useCallbackRef(() => {
        forceUpdate();
    });

    useEffect(() => {
        previewController.on('seek', onPreviewControllerSeek);

        return () => {
            previewController.off('seek', onPreviewControllerSeek);
        };
    }, [onPreviewControllerSeek, forceUpdate, previewController]);

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

    const activeObjects = project.objects.filter((object) => object.startInMS <= currentTimeInMS && currentTimeInMS < object.endInMS);

    function renderObjectView(object: BaseObject): React.ReactNode {
        const isSelected = selectedObject === object;

        switch (object.type) {
            case VideoObject.type:
                return (
                    <VideoObjectView
                        key={object.id}
                        video={object as VideoObject}
                        previewController={previewController}
                        selected={isSelected}
                        onSelect={() => onObjectSelect(object)}
                        onObjectChange={onObjectChange}
                    />
                );

            case CaptionObject.type:
                return (
                    <CaptionObjectView
                        key={object.id}
                        caption={object as CaptionObject}
                        selected={isSelected}
                        onSelect={() => onObjectSelect(object)}
                        onObjectChange={onObjectChange}
                    />
                );

            case ImageObject.type:
                return (
                    <ImageObjectView
                        key={object.id}
                        image={object as ImageObject}
                        selected={isSelected}
                        onSelect={() => onObjectSelect(object)}
                        onObjectChange={onObjectChange}
                    />
                );

            default:
                console.warn(`Unknown object type: ${object.type}`);
                return undefined;
        }
    }

    const onBaseClick = useCallbackRef(() => {
        onObjectSelect(null);
    });

    const onContentBaseClick = useCallbackRef((ev: React.MouseEvent) => {
        ev.stopPropagation();
    });

    const onBackgroundClick = useCallbackRef(() => {
        onObjectSelect(null);
    });

    return (
        <Base onClick={onBaseClick}>
            <ContentBase style={{ width: contentBaseWidth, height: contentBaseHeight }} onClick={onContentBaseClick}>
                <Stage options={pixiStageOption}>
                    <Background width={project.viewport.width} height={project.viewport.height} onClick={onBackgroundClick} />
                    {activeObjects.map(renderObjectView)}
                </Stage>
            </ContentBase>
        </Base>
    );
}
