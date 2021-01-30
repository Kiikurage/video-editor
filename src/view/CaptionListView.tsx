import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';
import { Project } from '../model/Project';
import { VideoController } from '../service/VideoController';
import { CaptionListItemView } from './CaptionListItemView';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useSortedArray } from './hooks/useSortedArray';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';

const Base = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
`;

interface Props {
    videoController: VideoController;
    project: Project;
    currentVideoTimeInMS: number;
    onAddCaptionButtonClick: () => void;
    onCaptionFocus?: (caption: Caption) => void;
    onCaptionChange?: (oldValue: Caption, newValue: Caption) => void;
    onCaptionRemoveButtonClick?: (caption: Caption) => void;
}

export function CaptionListView(props: Props): React.ReactElement {
    const forceUpdate = useThrottledForceUpdate();

    const {
        videoController,
        project,
        currentVideoTimeInMS,
        onCaptionFocus,
        onCaptionChange,
        onCaptionRemoveButtonClick,
        onAddCaptionButtonClick,
    } = props;

    const sortedCaptionList = useSortedArray(project.captions, (caption1, caption2) => {
        return caption1.startInMS < caption2.startInMS ? -1 : caption1.startInMS === caption2.startInMS ? 0 : +1;
    });

    const onVideoControllerSeek = useCallbackRef(() => {
        forceUpdate();
    });

    useEffect(() => {
        videoController.addEventListener('seek', onVideoControllerSeek);
        return () => {
            videoController.removeEventListener('seek', onVideoControllerSeek);
        };
    }, [onVideoControllerSeek, videoController]);

    return (
        <Base>
            {sortedCaptionList.map((caption) => (
                <CaptionListItemView
                    key={`${caption.startInMS}-${caption.endInMS}`}
                    caption={caption}
                    currentVideoTimeInMS={currentVideoTimeInMS}
                    onFocus={() => onCaptionFocus?.(caption)}
                    onCaptionChange={(newValue) => onCaptionChange?.(caption, newValue)}
                    onRemoveButtonClick={() => onCaptionRemoveButtonClick?.(caption)}
                />
            ))}
            <AddCaptionButton onClick={onAddCaptionButtonClick}>字幕を追加</AddCaptionButton>
        </Base>
    );
}

const AddCaptionButton = styled.button``;
