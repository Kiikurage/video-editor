import * as React from 'react';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { TextObject } from '../../model/objects/TextObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { NumberInput } from '../NumberInput';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function FontStylePropertyGroup<T extends TextObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onFontFamilyChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontFamily: value });
        });
    });
    const onFontWeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontWeight: value });
        });
    });
    const onFillChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fill: value });
        });
    });
    const onStrokeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, stroke: value });
        });
    });
    const onStrokeThicknessChange = useCallbackRef((value: number) => {
        appController.commitHistory(() => {
            appController.updateObject({ ...object, strokeThickness: value });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>フォント</PropertyGroupName>
            <PropertyRow>
                <FormControl>
                    <select defaultValue={object.fontSize} disabled={object.locked} onChange={onFontFamilyChange}>
                        <option value="Noto Sans JP">Noto Sans JP</option>
                    </select>
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl>
                    <select defaultValue={object.fontWeight} disabled={object.locked} onChange={onFontWeightChange}>
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
                        defaultValue={convertColorFromPixiToDOM(object.fill)}
                        readOnly={object.locked}
                        onChange={onFillChange}
                    />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="縁取りの色">
                    <input
                        type="color"
                        defaultValue={convertColorFromPixiToDOM(object.stroke)}
                        readOnly={object.locked}
                        onChange={onStrokeChange}
                    />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="縁取りの太さ">
                    <NumberInput defaultValue={object.strokeThickness} readOnly={object.locked} onChange={onStrokeThicknessChange} />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
