import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { Project } from '../../model/Project';

import { PreviewCanvasViewportInfo, usePreviewCanvasViewportInfo } from './PreviewPlayer';

interface Props {
    project: Project;
}

interface PixiProps {
    project: Project;
    canvasContext: PreviewCanvasViewportInfo;
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { project, canvasContext } = props;

    base.x = (0 - canvasContext.left) * canvasContext.scale;
    base.y = (0 - canvasContext.top) * canvasContext.scale;
    base.width = project.viewport.width * canvasContext.scale;
    base.height = project.viewport.height * canvasContext.scale;
    base.scale.x = 1;
    base.scale.y = 1;

    base.clear();
    base.beginFill(project.viewport.backgroundColor, 1);
    base.drawRect(0, 0, project.viewport.width * canvasContext.scale, project.viewport.height * canvasContext.scale);
    base.endFill();
}

const PixiBackground = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Graphics();

            const dropShadowFilter = new DropShadowFilter();
            dropShadowFilter.color = 0x000000;
            dropShadowFilter.alpha = 0.1;
            dropShadowFilter.blur = 3;
            dropShadowFilter.distance = 5;
            base.filters = [dropShadowFilter];

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'PixiBackground'
);

export function Background(props: Props): React.ReactElement {
    const { project } = props;
    const canvasContext = usePreviewCanvasViewportInfo();

    return <PixiBackground project={project} canvasContext={canvasContext} />;
}
