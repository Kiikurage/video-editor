import * as React from 'react';
import styled from 'styled-components';
import { BaseObject } from '../model/BaseObject';
import { CaptionObject } from '../model/CaptionObject';
import { VideoObject } from '../model/VideoObject';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
`;

const Body = styled.div`
    overflow: auto;
    flex: 1 1 0;
`;

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

const ObjectSummary = styled.div`
    padding: 16px 24px;
`;

const Footer = styled.footer`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 16px 24px;
`;

const DeleteButton = styled.button`
    flex: 1;
    padding: 0 16px;
    line-height: 40px;
    background: #c00;
    color: #fff;
    border: none;
    cursor: pointer;
`;

interface Props {
    object: BaseObject | null;
    onObjectRemove: (object: BaseObject) => void;
}

export function PropertyView(props: Props): React.ReactElement {
    const { object } = props;

    const onObjectRemove = useCallbackRef(() => {
        if (object !== null) {
            props.onObjectRemove(object);
        }
    });

    return (
        <Base>
            {object !== null && (
                <>
                    <Body>
                        <ObjectSummary>
                            <div>{object.type}</div>
                        </ObjectSummary>

                        <PropertyGroup>
                            <PropertyGroupName>一般</PropertyGroupName>
                            <PropertyRow>
                                <PropertyName>開始</PropertyName>
                                <input type="number" min={0} value={object.startInMS} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>終了</PropertyName>
                                <input type="number" min={0} value={object.endInMS} />
                            </PropertyRow>
                        </PropertyGroup>

                        {CaptionObject.isCaption(object) && (
                            <PropertyGroup>
                                <PropertyGroupName>字幕</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>内容</PropertyName>
                                    <textarea value={object.text} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}

                        {VideoObject.isVideo(object) && (
                            <PropertyGroup>
                                <PropertyGroupName>動画</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>元ファイル</PropertyName>
                                    <input type="text" value={object.srcFilePath} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}
                    </Body>

                    <Footer>
                        <DeleteButton onClick={onObjectRemove}>削除</DeleteButton>
                    </Footer>
                </>
            )}
        </Base>
    );
}
