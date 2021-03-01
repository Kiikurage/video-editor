import * as React from 'react';
import { useEffect } from 'react';
import { assert } from '../../lib/util';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
import { useAppController } from '../AppControllerProvider';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { NumberInput } from '../NumberInput';
import { PropertyGroup, PropertyGroupName } from './PropertyGroup';

export function AudioPropertyGroup<T extends AudioObject>(props: { object: T }): React.ReactElement {
    const { object } = props;
    const appController = useAppController();

    const onVolumeChange = useCallbackRef((value: number) => {
        assert(0 <= value && value <= 1, `Invalid volume value: ${value}`);

        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
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
        appController.on('tick', forceUpdate);
        appController.on('seek', forceUpdate);
        return () => {
            appController.off('tick', forceUpdate);
            appController.off('seek', forceUpdate);
        };
    });

    const volume = AnimatableValue.interpolate(object.volume, object.startInMS, object.endInMS, appController.currentTimeInMS);

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>音声</PropertyGroupName>
            <FormControl label="ボリューム">
                <NumberInput defaultValue={volume} min={0} max={1} onChange={onVolumeChange} readOnly={object.locked} />
            </FormControl>
        </PropertyGroup>
    );
}
