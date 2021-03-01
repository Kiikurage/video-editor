import * as React from 'react';
import LockedIcon from '../../icons/lock-24px.svg';
import UnlockedIcon from '../../icons/lock_open-24px.svg';
import { BaseObject } from '../../model/objects/BaseObject';
import { useAppController } from '../AppControllerProvider';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { TimePositionInput } from '../TimePositionInput';
import { PropertyColumn, PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function BasePropertyGroup<T extends BaseObject>(props: { object: T }): React.ReactElement {
    const { object } = props;
    const appController = useAppController();

    const onToggleLockButtonClick = useCallbackRef(() => {
        appController.commitHistory(() => {
            appController.updateObject({
                ...object,
                locked: !object.locked,
            });
        });
    });

    const onStartInMSChange = useCallbackRef((timeInMS: number) => {
        appController.commitHistory(() => {
            appController.updateObject({ ...object, startInMS: timeInMS });
        });
    });
    const onEndInMSChange = useCallbackRef((timeInMS: number) => {
        appController.commitHistory(() => {
            appController.updateObject({ ...object, endInMS: timeInMS });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>一般</PropertyGroupName>
            <PropertyRow>
                <PropertyColumn>
                    <FormControl label="開始">
                        <TimePositionInput value={object.startInMS} fps={appController.project.fps} onChange={onStartInMSChange} />
                    </FormControl>
                </PropertyColumn>
                <PropertyColumn>
                    <FormControl label="終了">
                        <TimePositionInput value={object.endInMS} fps={appController.project.fps} onChange={onEndInMSChange} />
                    </FormControl>
                </PropertyColumn>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="編集ロック">
                    <button onClick={onToggleLockButtonClick}>{object.locked ? <LockedIcon /> : <UnlockedIcon />}</button>
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
