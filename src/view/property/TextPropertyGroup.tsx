import * as React from 'react';
import styled from 'styled-components';
import { TextObject } from '../../model/objects/TextObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

const Textarea = styled.textarea`
    resize: none;
`;

export function TextPropertyGroup<T extends TextObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onTextChange = useCallbackRef((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, text: value });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>字幕</PropertyGroupName>
            <PropertyRow>
                <FormControl label="内容">
                    <Textarea rows={5} defaultValue={object.text} onChange={onTextChange} readOnly={object.locked} />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
