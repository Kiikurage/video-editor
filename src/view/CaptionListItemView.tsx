import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';
import CloseIcon from '../static/icons/close-24px.svg';
import { CircleButton } from './CIrcleButton';

const Base = styled.li<{ isActive: boolean }>`
    padding: 8px 32px;
    border-radius: 4px;
    border: 1px solid ${(props) => (props.isActive ? '#ff0000' : '#cccccc')};
    background: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.03);
    }

    &:focus {
        background: #eef3ff;
    }
`;

const CaptionTime = styled.div`
    font-size: 0.75em;
    margin: 0;
    color: #888;
`;

const CaptionTextColumn = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;

    hr {
        width: 100%;
        border: none;
        border-bottom: 1px dotted #ccc;
    }
`;

const CaptionText = styled.textarea`
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    resize: none;
`;

const EditableTextContainer = styled.div`
    position: relative;
    width: 100%;
    padding: 0;
    margin: 0;

    textarea {
        position: absolute;
        background: none;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
    }

    textarea,
    div {
        font: inherit;
        line-height: inherit;
        white-space: pre-wrap;
        word-break-cjk: keep-all;
        letter-spacing: inherit;
        font-kerning: none;
        padding: 4px 8px;
    }
`;

interface Props {
    caption: Caption;
    currentVideoTimeInMS: number;
    onFocus?: () => void;
    onCaptionChange?: (newValue: Caption) => void;
    onRemoveButtonClick?: () => void;
}

export function CaptionListItemView(props: Props): React.ReactElement {
    const { caption, currentVideoTimeInMS, onFocus, onCaptionChange, onRemoveButtonClick } = props;

    const [captionText, setCaptionText] = useState(caption.text);
    useEffect(() => {
        setCaptionText(caption.text);
    }, [caption.text]);

    const isActive = caption.startInMS <= currentVideoTimeInMS && currentVideoTimeInMS < caption.endInMS;

    const onCaptionTextChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = ev.target.value.replace(/[\r\t]/, '');
        setCaptionText(newValue);
    };

    const onCaptionTextBlur = () => {
        onCaptionChange?.({ ...caption, text: captionText });
    };

    return (
        <Base key={caption.text} tabIndex={0} onFocus={onFocus} isActive={isActive}>
            <CaptionTime>
                <div>{formatMillisecondsToSeconds(caption.startInMS)}</div>
                <div>{formatMillisecondsToSeconds(caption.endInMS)}</div>
            </CaptionTime>
            <CaptionTextColumn>
                <EditableTextContainer>
                    <div>{captionText}</div>
                    <CaptionText onChange={onCaptionTextChange} onBlur={onCaptionTextBlur} value={captionText} placeholder="字幕" />
                </EditableTextContainer>
            </CaptionTextColumn>
            <CircleButton onClick={onRemoveButtonClick}>
                <CloseIcon width={24} height={24} />
            </CircleButton>
        </Base>
    );
}

function formatMillisecondsToSeconds(timeInMS: number): string {
    const minute = Math.floor(timeInMS / 1000 / 60);
    const second = Math.floor(timeInMS / 1000) % 60;

    return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}
