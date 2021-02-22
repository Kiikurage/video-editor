import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { TextObject } from '../../model/objects/TextObject';
import { TextObjectViewRenderer } from '../Renderer/TextObjectViewRenderer';
import { usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';
import { ResizeView } from './ResizeView/ResizeView';

const TextObjectPixiView = CustomPIXIComponent(TextObjectViewRenderer, 'TextObjectPixiView');

export function TextObjectView(props: PreviewPlayerObjectViewProps<TextObject>): React.ReactElement {
    const { object, previewController, onChange, onSelect, selected } = props;
    const canvasContext = usePreviewCanvasViewportInfo();

    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, previewController.currentTimeInMS);

    return (
        <>
            <TextObjectPixiView object={object} canvasContext={canvasContext} timeInMS={previewController.currentTimeInMS} />
            <ResizeView
                x={x}
                y={y}
                width={width}
                height={height}
                selected={selected}
                locked={object.locked}
                onChange={onChange}
                onSelect={onSelect}
            />
        </>
    );
}
