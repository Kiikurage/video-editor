import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ShapeObject, ShapeType } from '../../model/objects/ShapeObject';
import { PreviewController } from '../../service/PreviewController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    shape: ShapeObject;
    previewController: PreviewController;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: (ev: PIXI.InteractionEvent) => void;
    onObjectChange: (oldObject: ShapeObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    object: ShapeObject;
    timeInMS: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShapeRendererMap: Record<ShapeType, (base: PIXI.Graphics, props: PixiProps) => void> = {
    [ShapeType.RECTANGLE]: renderRectangle,
    [ShapeType.CIRCLE]: renderCircle,
};

function renderRectangle(base: PIXI.Graphics, props: PixiProps) {
    const { object, timeInMS } = props;
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);
    const fill = AnimatableValue.interpolate(object.fill, object.startInMS, object.endInMS, timeInMS);
    const stroke = AnimatableValue.interpolate(object.stroke, object.startInMS, object.endInMS, timeInMS);

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawRect(0, 0, width, height);
    base.endFill();
}

function renderCircle(base: PIXI.Graphics, props: PixiProps) {
    const { object, timeInMS } = props;
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);
    const fill = AnimatableValue.interpolate(object.fill, object.startInMS, object.endInMS, timeInMS);
    const stroke = AnimatableValue.interpolate(object.stroke, object.startInMS, object.endInMS, timeInMS);

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawEllipse(width / 2, height / 2, width / 2, height / 2);
    base.endFill();
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { object, timeInMS } = props;

    base.x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    base.y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    base.scale.x = 1;
    base.scale.y = 1;
    base.clear();

    const shapeRenderer = ShapeRendererMap[object.shapeType];
    if (shapeRenderer === undefined) {
        console.warn(`Unsupported shape type: ${object.shapeType}`);
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
    const { shape, previewController, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(shape, x, y, width, height);
    });

    return (
        <>
            <ShapeObjectView object={shape} timeInMS={previewController.currentTimeInMS} />
            <ResizeView
                object={shape}
                previewController={previewController}
                snapPositionXs={snapPositionXs}
                snapPositionYs={snapPositionYs}
                onChange={onChange}
                onSelect={onSelect}
                selected={selected}
            />
        </>
    );
}

export { ShapeObjectViewWrapper as ShapeObjectView };
