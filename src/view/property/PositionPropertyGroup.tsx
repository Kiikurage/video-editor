import * as React from 'react';
import { useEffect } from 'react';
import { AnimatableValue, NumericAnimatableValue } from '../../model/objects/AnimatableValue';
import { BaseObject } from '../../model/objects/BaseObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { NumberInput } from '../NumberInput';
import { PropertyColumn, PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function PositionPropertyGroup<
    T extends BaseObject & {
        x: NumericAnimatableValue;
        y: NumericAnimatableValue;
        width: NumericAnimatableValue;
        height: NumericAnimatableValue;
    }
>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onXChange = useCallbackRef((value: number) => {
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
    const onYChange = useCallbackRef((value: number) => {
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
    const onWidthChange = useCallbackRef((value: number) => {
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject = {
                ...object,
                width: AnimatableValue.set(object.width, newFrameTiming, value),
            };
            appController.updateObject(newObject);
        });
    });
    const onHeightChange = useCallbackRef((value: number) => {
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );
            const newObject = {
                ...object,
                height: AnimatableValue.set(object.height, newFrameTiming, value),
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
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, appController.previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, appController.previewController.currentTimeInMS);

    return (
        <PropertyGroup>
            <PropertyGroupName>位置・サイズ</PropertyGroupName>
            <PropertyRow>
                <PropertyColumn>
                    <FormControl label="X">
                        <NumberInput min={0} value={x} onChange={onXChange} readOnly={object.locked} />
                    </FormControl>
                </PropertyColumn>
                <PropertyColumn>
                    <FormControl label="Y">
                        <NumberInput min={0} value={y} onChange={onYChange} readOnly={object.locked} />
                    </FormControl>
                </PropertyColumn>
            </PropertyRow>
            <PropertyRow>
                <PropertyColumn>
                    <FormControl label="幅">
                        <NumberInput min={0} value={width} onChange={onWidthChange} readOnly={object.locked} />
                    </FormControl>
                </PropertyColumn>
                <PropertyColumn>
                    <FormControl label="高さ">
                        <NumberInput min={0} value={height} onChange={onHeightChange} readOnly={object.locked} />
                    </FormControl>
                </PropertyColumn>
            </PropertyRow>
        </PropertyGroup>
    );
}
