import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useMemo } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { formatTime } from '../../lib/formatTime';
import { Box } from '../../model/Box';
import { AudioObject } from '../../model/objects/AudioObject';
import { BaseObject } from '../../model/objects/BaseObject';
import { ImageObject } from '../../model/objects/ImageObject';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TextObject } from '../../model/objects/TextObject';
import { VideoObject } from '../../model/objects/VideoObject';
import { AppController } from '../../service/AppController';
import { useCanvasSize } from '../CustomStage';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { ChildrenContainer } from './ChildrenContainer';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { useTimelineCanvasViewportInfo } from './Timeline';
import { TimelineAudioObjectView } from './TimelineAudioObjectView';
import { TimelineBaseObjectView, TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineImageObjectView } from './TimelineImageObjectView';
import { TimelineShapeObjectView } from './TimelineShapeObjectView';
import { TimelineTextObjectView } from './TimelineTextObjectView';
import { TimelineVideoObjectView } from './TimelineVideoObjectView';

interface DividerData {
    timeInMS: number;
    label: string;
    x: number;
}

interface TimelineNodeLayoutData {
    object: BaseObject;
    ComponentType: React.ComponentType<TimelineObjectViewProps>;
    rect: Box;
}

const TimelineObjectViewComponentMap = new Map<Constructor<BaseObject>, React.ComponentType<TimelineObjectViewProps<any>>>([
    [TextObject, TimelineTextObjectView],
    [ImageObject, TimelineImageObjectView],
    [VideoObject, TimelineVideoObjectView],
    [AudioObject, TimelineAudioObjectView],
    [ShapeObject, TimelineShapeObjectView],
]);

interface Props {
    appController: AppController;
    objects: BaseObject[];
}

export function TimelineContent(props: Props): React.ReactElement {
    const { objects, appController } = props;
    const { pixelPerMS, leftInMS: canvasScrollLeftInMS, top: canvasScrollTop } = useTimelineCanvasViewportInfo();
    const { width: canvasWidth, height: canvasHeight } = useCanvasSize();

    const onTimelineBaseClick = useCallbackRef((ev: PIXI.InteractionEvent) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = Math.max(0, ev.data.global.x / pixelPerMS + canvasScrollLeftInMS);
        appController.setSelectedObjects([]);
    });

    const onTimelineObjectClick = useCallbackRef((ev: PIXI.InteractionEvent, object: BaseObject) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = ev.data.global.x / pixelPerMS + canvasScrollLeftInMS;

        if (ev.data.originalEvent.shiftKey) {
            appController.addObjectToSelection(object.id);
        } else {
            appController.setSelectedObjects([object.id]);
        }
    });

    const onTimelineObjectChange = useCallbackRef((object: BaseObject, newX: number, newWidth: number) => {
        appController.commitHistory(() => {
            appController.updateObject(
                object.clone({
                    startInMS: quantizeTime(newX / pixelPerMS + canvasScrollLeftInMS, appController.project.fps),
                    endInMS: quantizeTime((newX + newWidth) / pixelPerMS + canvasScrollLeftInMS, appController.project.fps),
                })
            );
        });
    });

    const onTimelineObjectKeyframeClick = useCallbackRef((ev: PIXI.InteractionEvent, object: BaseObject, keyframeTiming: number) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = object.startInMS + (object.endInMS - object.startInMS) * keyframeTiming;

        if (ev.data.originalEvent.shiftKey) {
            appController.addObjectToSelection(object.id);
        } else {
            appController.setSelectedObjects([object.id]);
        }
    });

    const { visibleItems } = computeTimelineNodeLayoutData(
        objects,
        canvasScrollLeftInMS,
        canvasScrollTop,
        canvasWidth,
        canvasHeight,
        pixelPerMS
    );

    const dividerData: DividerData[] = useMemo(() => {
        const data: DividerData[] = [];
        const dividerDurationInMS = computeBestDividerDuration(pixelPerMS, 120);

        let durationOffset = Math.max(0, Math.ceil(canvasScrollLeftInMS / dividerDurationInMS) * dividerDurationInMS);

        while (durationOffset * pixelPerMS < canvasScrollLeftInMS * pixelPerMS + canvasWidth) {
            data.push({
                timeInMS: durationOffset,
                label: formatTime(durationOffset, appController.project.fps),
                x: (durationOffset - canvasScrollLeftInMS) * pixelPerMS,
            });
            durationOffset += dividerDurationInMS;
        }

        return data;
    }, [appController.project.fps, canvasScrollLeftInMS, canvasWidth, pixelPerMS]);

    const objectViews: React.ReactNode[] = useMemo(() => {
        const snapPositionXsBase = visibleItems.map((layoutData) => [layoutData.rect.x, layoutData.rect.x + layoutData.rect.width]).flat();

        return visibleItems.map((layoutData) => {
            const snapPositionXs = snapPositionXsBase.slice();
            for (const targetX of [layoutData.rect.x, layoutData.rect.x + layoutData.rect.width]) {
                const i = snapPositionXs.indexOf(targetX);
                if (i === -1) continue;

                snapPositionXs.splice(i, 1);
            }

            return (
                <layoutData.ComponentType
                    {...layoutData.rect}
                    object={layoutData.object}
                    key={layoutData.object.id}
                    snapPositionXs={snapPositionXs}
                    isSelected={appController.selectedObjectIds.has(layoutData.object.id)}
                    onClick={onTimelineObjectClick}
                    onChange={onTimelineObjectChange}
                    onKeyframeClick={onTimelineObjectKeyframeClick}
                />
            );
        });
    }, [appController.selectedObjectIds, visibleItems, onTimelineObjectChange, onTimelineObjectClick, onTimelineObjectKeyframeClick]);

    return (
        <>
            <Header data={dividerData} width={canvasWidth} height={canvasHeight} onClick={onTimelineBaseClick} />

            {dividerData.map(({ x, label }) => (
                <Label x={x} label={label} key={label} />
            ))}

            <ChildrenContainer x={0} y={20} width={canvasWidth} height={canvasHeight - 20}>
                {objectViews}

                <CurrentTimeIndicator
                    x={(appController.previewController.currentTimeInMS - canvasScrollLeftInMS) * pixelPerMS}
                    height={canvasHeight}
                />
            </ChildrenContainer>
        </>
    );
}

function computeTimelineNodeLayoutData(
    objects: BaseObject[],
    canvasScrollLeftInMS: number,
    canvasScrollTop: number,
    canvasWidth: number,
    canvasHeight: number,
    pixelPerMS: number
): {
    visibleItems: TimelineNodeLayoutData[];
    canvasScrollHeight: number;
} {
    const visibleItems: TimelineNodeLayoutData[] = [];
    let y = 10 - canvasScrollTop;
    const SPACE_Y = 8;
    for (const object of objects) {
        let height: number;
        if (object instanceof VideoObject) {
            height = 56;
        } else {
            height = 36;
        }
        const x = (object.startInMS - canvasScrollLeftInMS) * pixelPerMS;
        const width = (object.endInMS - object.startInMS) * pixelPerMS;

        if (canvasHeight > y && 0 < y + height && canvasWidth > x && 0 < x + width) {
            const ComponentType =
                TimelineObjectViewComponentMap.get(object.constructor as Constructor<BaseObject>) ?? TimelineBaseObjectView;
            visibleItems.push({
                object: object,
                ComponentType,
                rect: { x: x, y: y, width: width, height: height },
            });
        }
        y += height + SPACE_Y;
    }
    const canvasScrollHeight = y;

    return { visibleItems, canvasScrollHeight };
}

function quantizeTime(timeInMS: number, fps: number): number {
    return Math.round(timeInMS / (1000 / fps)) * (1000 / fps);
}

function computeBestDividerDuration(pixelPerMS: number, minimumSpanInPixel: number): number {
    return (
        DIVIDER_DURATION_PRESET.find((durationInMS) => durationInMS * pixelPerMS > minimumSpanInPixel) ??
        DIVIDER_DURATION_PRESET[DIVIDER_DURATION_PRESET.length - 1]
    );
}

const DIVIDER_DURATION_PRESET = [
    200,
    500,
    1000,
    1000 * 2,
    1000 * 5,
    1000 * 10,
    1000 * 30,
    1000 * 60,
    1000 * 60 * 2,
    1000 * 60 * 5,
    1000 * 60 * 10,
    1000 * 60 * 30,
    1000 * 60 * 60,
];

interface PixiHeaderProps {
    data: DividerData[];
    width: number;
    height: number;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

function applyGridProps(base: PIXI.Graphics, props: PixiHeaderProps) {
    const { data, width, height } = props;
    base.clear();

    base.lineStyle(1, 0xc0c0c0, 1);
    base.moveTo(0, 20);
    base.lineTo(width, 20);

    base.interactive = true;
    base.hitArea = new PIXI.Rectangle(0, 0, width, height);

    for (const { x } of data) {
        base.lineStyle(1, 0xc0c0c0, 1);
        base.moveTo(x, 14);
        base.lineTo(x, 20);
    }
}

const Header = CustomPIXIComponent<PIXI.Graphics, PixiHeaderProps>(
    {
        customDisplayObject(props: PixiHeaderProps) {
            const base = new PIXI.Graphics();

            applyGridProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiHeaderProps, newProps: PixiHeaderProps): void {
            applyGridProps(base, newProps);

            if (oldProps.onClick) base.off('click', oldProps.onClick);
            if (newProps.onClick) base.on('click', newProps.onClick);
        },
    },
    'TimelineContent-Header'
);

interface PixiLabelProps {
    x: number;
    label: string;
}

function applyLabelProps(base: PIXI.Text, props: PixiLabelProps) {
    const { x, label } = props;
    base.text = label;
    base.anchor.x = 0.5;
    base.anchor.y = 0;
    base.x = x;
    base.y = 2;
    base.scale.x = 1;
    base.scale.y = 1;
    base.style = {
        fontSize: 12,
        fill: 0x808080,
        fontWeight: '100',
    };
}

const Label = CustomPIXIComponent<PIXI.Text, PixiLabelProps>(
    {
        customDisplayObject(props: PixiLabelProps) {
            const base = new PIXI.Text('');

            applyLabelProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Text, oldProps: PixiLabelProps, newProps: PixiLabelProps): void {
            applyLabelProps(base, newProps);
        },
    },
    'TimelineContent-Label'
);
