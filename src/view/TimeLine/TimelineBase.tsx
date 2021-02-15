import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useMemo } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { formatTime } from '../../lib/formatTime';
import { useTimelineContext } from './TimeLine';
import { ChildrenContainer } from './ChildrenContainer';

interface DividerData {
    timeInMS: number;
    x: number;
    label: string;
    labeled: boolean;
}

interface Props {
    fps: number;
    width: number;
    height: number;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

interface PixiGridProps {
    data: DividerData[];
    width: number;
    height: number;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

interface PixiLabelProps {
    x: number;
    label: string;
}

function applyGridProps(base: PIXI.Graphics, props: PixiGridProps) {
    const { data, width, height } = props;
    base.clear();
    base.beginFill(0xffffff, 1);
    base.drawRect(0, 0, width, height);
    base.endFill();

    base.beginFill(0xf0f0f0, 1);
    base.drawRect(0, 0, width, 28);
    base.endFill();

    base.lineStyle(1, 0xc0c0c0, 1);
    base.moveTo(0, 28);
    base.lineTo(width, 28);

    base.interactive = true;

    for (const { x, labeled } of data) {
        base.lineStyle(1, labeled ? 0xd0d0d0 : 0xe8e8e8, 1);
        base.moveTo(x, labeled ? 22 : 28);
        base.lineTo(x, height);
    }
}

const Grid = CustomPIXIComponent<PIXI.Graphics, PixiGridProps>(
    {
        customDisplayObject(props: PixiGridProps) {
            const base = new PIXI.Graphics();

            applyGridProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiGridProps, newProps: PixiGridProps): void {
            applyGridProps(base, newProps);

            if (oldProps.onClick) base.off('click', oldProps.onClick);
            if (newProps.onClick) base.on('click', newProps.onClick);
        },
    },
    'TimelineBase-Grid'
);

function applyLabelProps(base: PIXI.Text, props: PixiLabelProps) {
    const { x, label } = props;
    base.text = label;
    base.anchor.x = 0.5;
    base.anchor.y = 0;
    base.x = x;
    base.y = 5;
    base.scale.x = 1;
    base.scale.y = 1;
    base.style = {
        fontSize: 14,
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
    'TimelineBase-Label'
);

export function TimelineBase(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { fps, height, width, children, onClick } = props;
    const { rightInMS, leftInMS, pixelPerMS } = useTimelineContext();

    const data: DividerData[] = useMemo(() => {
        const data: DividerData[] = [];
        const labeledDividerDurationInMS = computeBestDividerDuration(pixelPerMS, 120);
        const nonLabeledDividerDurationInMS = computeBestDividerDuration(pixelPerMS, 20);

        let durationOffset = Math.ceil(leftInMS / nonLabeledDividerDurationInMS) * nonLabeledDividerDurationInMS;
        let nextLabelerDividerDurationOffset = Math.ceil(leftInMS / labeledDividerDurationInMS) * labeledDividerDurationInMS;

        while (durationOffset < rightInMS) {
            let isLabeled = false;
            if (durationOffset === nextLabelerDividerDurationOffset) {
                isLabeled = true;
                nextLabelerDividerDurationOffset += labeledDividerDurationInMS;
            }
            data.push({
                labeled: isLabeled,
                timeInMS: durationOffset,
                label: formatTime(durationOffset, fps),
                x: (durationOffset - leftInMS) * pixelPerMS,
            });
            durationOffset += nonLabeledDividerDurationInMS;
        }

        return data;
    }, [fps, pixelPerMS, rightInMS, leftInMS]);

    return (
        <>
            <Grid data={data} width={width} height={height} onClick={onClick} />
            {data
                .filter((data) => data.labeled)
                .map(({ x, label }, i) => (
                    <Label x={x} label={label} key={i} />
                ))}
            <ChildrenContainer x={0} y={28} width={width} height={height - 28}>
                {children}
            </ChildrenContainer>
        </>
    );
}

function computeBestDividerDuration(pixelPerMS: number, minimumSpanInPixel: number) {
    return (
        DIVIDER_DURATION_PRESET.find((durationInMS) => durationInMS * pixelPerMS > minimumSpanInPixel) ??
        DIVIDER_DURATION_PRESET[DIVIDER_DURATION_PRESET.length - 1]
    );
}

const DIVIDER_DURATION_PRESET = [
    200,
    1000,
    1000 * 2,
    1000 * 5,
    1000 * 10,
    1000 * 30,
    1000 * 60,
    1000 * 60 * 5,
    1000 * 60 * 10,
    1000 * 60 * 30,
    1000 * 60 * 60,
];
