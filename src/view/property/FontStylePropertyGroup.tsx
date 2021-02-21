import * as React from 'react';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { BaseObject } from '../../model/objects/BaseObject';
import { FontStyle } from '../../model/objects/FontStyle';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { NumberInput } from '../NumberInput';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function FontStylePropertyGroup<T extends BaseObject & { fontStyle: FontStyle }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onFontFamilyChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fontFamily: value } });
        });
    });
    const onFontWeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fontWeight: value } });
        });
    });
    const onFillChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fill: value } });
        });
    });
    const onStrokeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, stroke: value } });
        });
    });
    const onStrokeThicknessChange = useCallbackRef((value: number) => {
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, strokeThickness: value } });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>フォント</PropertyGroupName>
            <PropertyRow>
                <FormControl>
                    <select defaultValue={object.fontStyle.fontSize} disabled={object.locked} onChange={onFontFamilyChange}>
                        <option value="Noto Sans JP">Noto Sans JP</option>
                    </select>
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl>
                    <select defaultValue={object.fontStyle.fontWeight} disabled={object.locked} onChange={onFontWeightChange}>
                        <option value="100">100</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="700">700</option>
                        <option value="900">900</option>
                    </select>
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="色">
                    <input
                        type="color"
                        defaultValue={convertColorFromPixiToDOM(object.fontStyle.fill)}
                        readOnly={object.locked}
                        onChange={onFillChange}
                    />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="縁取りの色">
                    <input
                        type="color"
                        defaultValue={convertColorFromPixiToDOM(object.fontStyle.stroke)}
                        readOnly={object.locked}
                        onChange={onStrokeChange}
                    />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="縁取りの太さ">
                    <NumberInput
                        defaultValue={object.fontStyle.strokeThickness}
                        readOnly={object.locked}
                        onChange={onStrokeThicknessChange}
                    />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
