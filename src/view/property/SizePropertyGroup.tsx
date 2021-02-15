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

export function SizePropertyGroup<T extends BaseObject & { width: NumericAnimatableValue; height: NumericAnimatableValue }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, width: value });
        });
    });
    const onHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, height: value });
        });
    });

    const width = AnimatableValue.interpolate(
        object.width,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );
    const height = AnimatableValue.interpolate(
        object.height,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );

    const forceUpdate = useForceUpdate();
    useEffect(() => {
        appController.previewController.on('tick', forceUpdate);
        appController.previewController.on('seek', forceUpdate);
        return () => {
            appController.previewController.off('tick', forceUpdate);
            appController.previewController.off('seek', forceUpdate);
        };
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>サイズ</PropertyGroupName>
            <PropertyRow>
                <PropertyName>幅</PropertyName>
                <input type="number" min={0} value={width} onChange={onWidthChange} readOnly={object.locked} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>高さ</PropertyName>
                <input type="number" min={0} value={height} onChange={onHeightChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
