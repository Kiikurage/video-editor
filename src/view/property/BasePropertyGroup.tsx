import * as React from 'react';
import styled from 'styled-components';
import LockedIcon from '../../icons/lock-24px.svg';
import UnlockedIcon from '../../icons/lock_open-24px.svg';
import { formatTime } from '../../lib/formatTime';
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

export function BasePropertyGroup<T extends BaseObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;

    const onToggleLockButtonClick = useCallbackRef(() => {
        appController.commitHistory(() => {
            appController.updateObject({
                ...object,
                locked: !object.locked,
            });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>一般</PropertyGroupName>
            <PropertyRow>
                <PropertyName>開始</PropertyName>
                <span>{formatTime(object.startInMS, appController.project.fps)}</span>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>終了</PropertyName>
                <span>{formatTime(object.endInMS, appController.project.fps)}</span>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>編集ロック</PropertyName>
                <button onClick={onToggleLockButtonClick}>{object.locked ? <LockedIcon /> : <UnlockedIcon />}</button>
            </PropertyRow>
        </PropertyGroup>
    );
}
