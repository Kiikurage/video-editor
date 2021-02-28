import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { TextFrame } from '../../model/frame/TextFrame';
import { TextObjectViewRenderer } from '../Renderer/TextObjectViewRenderer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

const TextObjectPixiView = CustomPIXIComponent(TextObjectViewRenderer, 'TextObjectPixiView');

export function TextObjectView(props: PreviewPlayerObjectViewProps<TextFrame>): React.ReactElement {
    const { frame } = props;

    return <TextObjectPixiView frame={frame} />;
}
