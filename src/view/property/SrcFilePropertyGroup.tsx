import * as React from 'react';
import { BaseObject } from '../../model/objects/BaseObject';
import { AppController } from '../../service/AppController';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PropertyGroup, PropertyRow } from './PropertyGroup';

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
                <FormControl label="元ファイル">
                    <input type="file" onChange={onFileChange} readOnly={object.locked} />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
