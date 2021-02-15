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
    shapeType: string;
    width: number;
    height: number;
    stroke: number;
    fill: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShapeRendererMap: Record<ShapeType, (base: PIXI.Graphics, props: PixiProps) => void> = {
    [ShapeType.RECTANGLE]: renderRectangle,
    [ShapeType.CIRCLE]: renderCircle,
};

function renderRectangle(base: PIXI.Graphics, props: PixiProps) {
    const { width, height, stroke, fill } = props;

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawRect(0, 0, width, height);
    base.endFill();
}

function renderCircle(base: PIXI.Graphics, props: PixiProps) {
    const { width, height, stroke, fill } = props;

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawEllipse(width / 2, height / 2, width / 2, height / 2);
    base.endFill();
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { shapeType } = props;

    base.x = 0;
    base.y = 0;
    base.scale.x = 1;
    base.scale.y = 1;
    base.clear();

    const shapeRenderer = ShapeRendererMap[shapeType];
    if (shapeRenderer === undefined) {
        console.warn(`Unsupported shape type: ${shapeType}`);
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

    const x = AnimatableValue.interpolate(shape.x, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(shape.y, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(shape.width, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);
    const height = AnimatableValue.interpolate(shape.height, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);
    const fill = AnimatableValue.interpolate(shape.fill, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);
    const stroke = AnimatableValue.interpolate(shape.stroke, shape.startInMS, shape.endInMS, previewController.currentTimeInMS);

    return (
        <ResizeView
            x={x}
            y={y}
            width={width}
            height={height}
            locked={shape.locked}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onChange={onChange}
            onSelect={onSelect}
            selected={selected}
        >
            <ShapeObjectView width={width} height={height} fill={fill} stroke={stroke} shapeType={shape.shapeType} />
        </ResizeView>
    );
}

export { ShapeObjectViewWrapper as ShapeObjectView };
