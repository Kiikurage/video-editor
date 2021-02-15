import * as React from 'react';
import styled from 'styled-components';
import { TextObject } from '../../model/objects/TextObject';
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
                <PropertyName>内容</PropertyName>
                <Textarea rows={5} defaultValue={object.text} onChange={onTextChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
