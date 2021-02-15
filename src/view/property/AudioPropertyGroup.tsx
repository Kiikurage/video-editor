import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { assert } from '../../lib/util';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
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

export function AudioPropertyGroup<T extends AudioObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onVolumeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(ev.target.value);
        assert(0 <= value && value <= 1, `Invalid volume value: ${value}`);

        appController.commitHistory(() => {
            appController.updateObject({ ...object, volume: value });
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

    const volume = AnimatableValue.interpolate(
        object.volume,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>音声</PropertyGroupName>
            <PropertyRow>
                <PropertyName>ボリューム</PropertyName>
                <input type="number" defaultValue={volume} min={0} max={1} onChange={onVolumeChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
