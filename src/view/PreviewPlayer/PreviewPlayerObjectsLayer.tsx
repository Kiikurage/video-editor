import * as React from 'react';
import { ComponentType } from 'react';
import { Container } from 'react-pixi-fiber';
import { Frame } from '../../model/frame/Frame';
import { AppController } from '../../service/AppController';
import { AudioObjectView } from './AudioObjectView';
import { ImageObjectView } from './ImageObjectView';
import { usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';
import { ShapeObjectView } from './ShapeObjectView';
import { TextObjectView } from './TextObjectView';
import { VideoObjectView } from './VideoObjectView';

const ObjectViewMap: Record<string, ComponentType<PreviewPlayerObjectViewProps<never>>> = {
    ['VIDEO']: VideoObjectView,
    ['TEXT']: TextObjectView,
    ['IMAGE']: ImageObjectView,
    ['SHAPE']: ShapeObjectView,
    ['AUDIO']: AudioObjectView,
};

interface Props {
    frames: Frame[];
    appController: AppController;
}

export function PreviewPlayerObjectsLayer(props: Props): React.ReactElement {
    const { frames, appController } = props;
    const canvasContext = usePreviewCanvasViewportInfo();

    return (
        <Container x={-canvasContext.left * canvasContext.scale} y={-canvasContext.top * canvasContext.scale} scale={canvasContext.scale}>
            {frames.map((frame: Frame) => {
                const Renderer = ObjectViewMap[frame.type];

                if (Renderer === undefined) {
                    console.warn(`Unknown object type: ${frame.type}`);
                    return null;
                }

                return <Renderer key={frame.id} frame={frame as never} previewController={appController.previewController} />;
            })}
        </Container>
    );
}
