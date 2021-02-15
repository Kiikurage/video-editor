import { useEffect } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { AppController } from '../../service/AppController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { ResizableObject } from '../PreviewPlayer/ResizeView/ResizableObejct';

const PropertyGroup = styled.div`
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    justify-content: stretch;

    & + & {
        border-top: 1px solid #c0c0c0;
    }
`;

const PropertyGroupName = styled.header`
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: #888;
    line-height: 1;
`;

const PropertyRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
`;

const PropertyName = styled.header`
    font-size: 12px;
    color: #444;
`;

export function ShapePropertyGroup<T extends ShapeObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onFillChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject: ResizableObject = {
                ...object,
                fill: AnimatableValue.set(object.fill, newFrameTiming, value),
            };
            appController.updateObject(newObject);
        });
    });
    const onStrokeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject: ResizableObject = {
                ...object,
                stroke: AnimatableValue.set(object.stroke, newFrameTiming, value),
            };
            appController.updateObject(newObject);
        });
    });

    const forceUpdate = useForceUpdate();
    useEffect(() => {
        appController.previewController.on('tick', forceUpdate);
        appController.previewController.on('seek', forceUpdate);
        return () => {
            appController.previewController.off('tick', forceUpdate);
            appController.previewController.off('seek', forceUpdate);
        };
    });

    const fill = AnimatableValue.interpolate(
        object.fill,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );
    const stroke = AnimatableValue.interpolate(
        object.stroke,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>図形</PropertyGroupName>
            <PropertyRow>
                <PropertyName>塗りの色</PropertyName>
                <input type="color" value={convertColorFromPixiToDOM(fill)} readOnly={object.locked} onChange={onFillChange} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>縁取りの色</PropertyName>
                <input type="color" value={convertColorFromPixiToDOM(stroke)} readOnly={object.locked} onChange={onStrokeChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}
