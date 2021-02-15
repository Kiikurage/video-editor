import * as React from 'react';
import styled from 'styled-components';
import { BaseObject } from '../../model/objects/BaseObject';
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

export function SrcFilePropertyGroup<T extends BaseObject & { srcFilePath: string }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onFileChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const files = ev.target.files;
        if (files?.length !== 1) return;

        appController.commitHistory(() => {
            appController.updateObject({ ...object, srcFilePath: files[0].path });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyRow>
                <PropertyName>元ファイル</PropertyName>
                <input type="file" onChange={onFileChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
