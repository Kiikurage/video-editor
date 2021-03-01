import * as React from 'react';
import { useEffect } from 'react';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ResizableObject } from '../../model/objects/ResizableObejct';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { useAppController } from '../AppControllerProvider';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function ShapePropertyGroup<T extends ShapeObject>(props: { object: T }): React.ReactElement {
    const { object } = props;
    const appController = useAppController();

    const onFillChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            const newFrameTiming = Math.min(
                Math.max(0, (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
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
                Math.max(0, (appController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
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
        appController.on('tick', forceUpdate);
        appController.on('seek', forceUpdate);
        return () => {
            appController.off('tick', forceUpdate);
            appController.off('seek', forceUpdate);
        };
    });

    const fill = AnimatableValue.interpolate(object.fill, object.startInMS, object.endInMS, appController.currentTimeInMS);
    const stroke = AnimatableValue.interpolate(object.stroke, object.startInMS, object.endInMS, appController.currentTimeInMS);

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>図形</PropertyGroupName>
            <PropertyRow>
                <FormControl label="塗りの色">
                    <input type="color" value={convertColorFromPixiToDOM(fill)} readOnly={object.locked} onChange={onFillChange} />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="縁取りの色">
                    <input type="color" value={convertColorFromPixiToDOM(stroke)} readOnly={object.locked} onChange={onStrokeChange} />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
