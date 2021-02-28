import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { ShapeFrame } from '../../model/frame/ShapeFrame';
import { ShapeObjectViewRenderer } from '../Renderer/ShapeObjectViewRenderer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

const ShapeObjectPixiView = CustomPIXIComponent(ShapeObjectViewRenderer, 'ShapeObjectPixiView');

export function ShapeObjectView(props: PreviewPlayerObjectViewProps<ShapeFrame>): React.ReactElement {
    const { frame } = props;

    return <ShapeObjectPixiView frame={frame} />;
}
