import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { ImageFrame } from '../../model/frame/ImageFrame';
import { ImageObjectViewRenderer } from '../Renderer/ImageObjectViewRenderer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

const ImageObjectPixiView = CustomPIXIComponent(ImageObjectViewRenderer, 'ImageObjectPixiView');

export function ImageObjectView(props: PreviewPlayerObjectViewProps<ImageFrame>): React.ReactElement {
    const { frame } = props;

    return <ImageObjectPixiView frame={frame} />;
}
