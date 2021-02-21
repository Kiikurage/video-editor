import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { TextObject } from '../../model/objects/TextObject';
import { TextObjectViewRenderer } from '../Renderer/TextObjectViewRenderer';
import { usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

const TextObjectPixiView = CustomPIXIComponent(TextObjectViewRenderer, 'TextObjectPixiView');

export function TextObjectView(props: PreviewPlayerObjectViewProps<TextObject>): React.ReactElement {
    const { object, previewController } = props;
    const canvasContext = usePreviewCanvasViewportInfo();

    return <TextObjectPixiView object={object} canvasContext={canvasContext} timeInMS={previewController.currentTimeInMS} />;
}
