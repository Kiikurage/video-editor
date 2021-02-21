import * as React from 'react';
import { useEffect } from 'react';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { ResizableObject } from '../PreviewPlayer/ResizeView/ResizableObejct';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

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
