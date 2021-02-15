import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { AnimatableValue, NumericAnimatableValue } from '../../model/objects/AnimatableValue';
import { BaseObject } from '../../model/objects/BaseObject';
import { AppController } from '../../service/AppController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';

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

export function PositionPropertyGroup<T extends BaseObject & { x: NumericAnimatableValue; y: NumericAnimatableValue }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onXChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject = {
                ...object,
                x: AnimatableValue.set(object.x, newFrameTiming, value),
            };
            appController.updateObject(newObject);
        });
    });
    const onYChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject = {
                ...object,
                y: AnimatableValue.set(object.y, newFrameTiming, value),
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

    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, appController.previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, appController.previewController.currentTimeInMS);

    return (
        <PropertyGroup>
            <PropertyGroupName>位置</PropertyGroupName>
            <PropertyRow>
                <PropertyName>X</PropertyName>
                <input type="number" min={0} value={x} onChange={onXChange} readOnly={object.locked} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>Y</PropertyName>
                <input type="number" min={0} value={y} onChange={onYChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
