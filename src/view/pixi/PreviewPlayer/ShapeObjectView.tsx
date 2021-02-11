import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { ShapeObject, ShapeType } from '../../../model/objects/ShapeObject';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShapeRendererMap: Record<ShapeType, (base: PIXI.Graphics, props: PixiProps) => void> = {
    [ShapeType.RECTANGLE]: renderRectangle,
    [ShapeType.CIRCLE]: renderCircle,
};

function renderRectangle(base: PIXI.Graphics, props: PixiProps) {
    const { shape } = props;

    base.lineStyle(4, shape.stroke);
    base.beginFill(shape.fill);
    base.drawRect(0, 0, shape.width, shape.height);
    base.endFill();
}

function renderCircle(base: PIXI.Graphics, props: PixiProps) {
    const { shape } = props;

    base.lineStyle(4, shape.stroke);
    base.beginFill(shape.fill);
    base.drawEllipse(shape.width / 2, shape.height / 2, shape.width / 2, shape.height / 2);
    base.endFill();
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { shape } = props;

    base.x = 0;
    base.y = 0;
    base.scale.x = 1;
    base.scale.y = 1;
    base.clear();

    const shapeRenderer = ShapeRendererMap[shape.shapeType];
    if (shapeRenderer === undefined) {
        console.warn(`Unsupported shape type: ${shape.shapeType}`);
    } else {
        shapeRenderer(base, props);
    }
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
