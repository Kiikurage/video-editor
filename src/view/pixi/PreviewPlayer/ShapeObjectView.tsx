import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { ShapeObject } from '../../../model/objects/ShapeObject';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    shape: ShapeObject;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: () => void;
    onObjectChange: (oldObject: ShapeObject, newObject: ShapeObject) => void;
}

interface PixiProps {
    shape: ShapeObject;
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { shape } = props;

    base.x = 0;
    base.y = 0;
    base.scale.x = 1;
    base.scale.y = 1;
    base.clear();
    base.lineStyle(4, shape.stroke);
    base.beginFill(shape.fill);

    // TODO: 図形の形を差し替え可能にする
    base.drawRect(0, 0, shape.width, shape.height);

    base.endFill();
}

export const ShapeObjectViewBehavior: CustomPIXIComponentBehaviorDefinition<PIXI.Graphics, PixiProps> = {
    customDisplayObject(props: PixiProps) {
        const base = new PIXI.Graphics();

        applyProps(base, props);

        return base;
    },
    customApplyProps(base: PIXI.Graphics, oldObject: PixiProps, newObject: PixiProps) {
        applyProps(base, newObject);
    },
};

const ShapeObjectView = CustomPIXIComponent(ShapeObjectViewBehavior, 'ShapeObjectView');

function ShapeObjectViewWrapper(props: Props): React.ReactElement {
    const { shape, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    return (
        <ResizeView
            object={shape}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onObjectChange={onObjectChange}
            onSelect={onSelect}
            selected={selected}
        >
            <ShapeObjectView shape={shape} />
        </ResizeView>
    );
}

export { ShapeObjectViewWrapper as ShapeObjectView };
