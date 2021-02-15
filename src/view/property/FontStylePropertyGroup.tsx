import * as React from 'react';
import styled from 'styled-components';
import { convertColorFromDOMToPixi } from '../../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../../lib/convertColorFromPixiToDOM';
import { BaseObject } from '../../model/objects/BaseObject';
import { FontStyle } from '../../model/objects/FontStyle';
import { AppController } from '../../service/AppController';
import { useCallbackRef } from '../hooks/useCallbackRef';

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
    const onStrokeThicknessChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, strokeThickness: value } });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>フォント</PropertyGroupName>
            <PropertyRow>
                <PropertyName>フォントの種類</PropertyName>
                <select defaultValue={object.fontStyle.fontSize} disabled={object.locked} onChange={onFontFamilyChange}>
                    <option value="Noto Sans JP">Noto Sans JP</option>
                </select>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>太さ</PropertyName>
                <select defaultValue={object.fontStyle.fontWeight} disabled={object.locked} onChange={onFontWeightChange}>
                    <option value="100">100</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="700">700</option>
                    <option value="900">900</option>
                </select>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>色</PropertyName>
                <input
                    type="color"
                    defaultValue={convertColorFromPixiToDOM(object.fontStyle.fill)}
                    readOnly={object.locked}
                    onChange={onFillChange}
                />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>縁取りの色</PropertyName>
                <input
                    type="color"
                    defaultValue={convertColorFromPixiToDOM(object.fontStyle.stroke)}
                    readOnly={object.locked}
                    onChange={onStrokeChange}
                />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>縁取りの太さ</PropertyName>
                <input
                    type="number"
                    defaultValue={object.fontStyle.strokeThickness}
                    readOnly={object.locked}
                    onChange={onStrokeThicknessChange}
                />
            </PropertyRow>
        </PropertyGroup>
    );
}
