import * as React from 'react';
import { useEffect } from 'react';
import { assert } from '../../lib/util';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { NumberInput } from '../NumberInput';
import { PropertyGroup, PropertyGroupName } from './PropertyGroup';

export function AudioPropertyGroup<T extends AudioObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onVolumeChange = useCallbackRef((value: number) => {
        assert(0 <= value && value <= 1, `Invalid volume value: ${value}`);

        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject = {
                ...object,
                volume: AnimatableValue.set(object.volume, newFrameTiming, value),
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

    const volume = AnimatableValue.interpolate(
        object.volume,
        object.startInMS,
        object.endInMS,
        appController.previewController.currentTimeInMS
    );

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>音声</PropertyGroupName>
            <FormControl label="ボリューム">
                <NumberInput defaultValue={volume} min={0} max={1} onChange={onVolumeChange} readOnly={object.locked} />
            </FormControl>
        </PropertyGroup>
    );
}
