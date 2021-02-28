import PIXISound from 'pixi-sound';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AudioFrame } from '../../model/frame/AudioFrame';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

export function AudioObjectView(props: PreviewPlayerObjectViewProps<AudioFrame>): React.ReactElement {
    const { frame, previewController } = props;

    const [sound, setSound] = useState<PIXISound.Sound | null>(null);
    useEffect(() => {
        setSound(
            PIXISound.Sound.from({
                url: frame.srcFilePath,
                preload: true,
                autoPlay: false,
            })
        );
    }, [frame.srcFilePath]);

    useEffect(() => {
        if (sound === null) return;
        sound.volume = frame.volume;
    }, [frame.volume, sound]);

    const onPreviewPlay = useCallbackRef(() => {
        if (frame.timeInMS < 0 || frame.timeInMS >= frame.duration) return;
        void sound?.play({ start: frame.timeInMS / 1000 });
    });

    const onPreviewSeek = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (frame.timeInMS < 0 || frame.timeInMS >= frame.duration) {
            sound.stop();
        } else {
            sound.stop();
            void sound.play({ start: frame.timeInMS / 1000 });
        }
    });

    const onPreviewTick = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (frame.timeInMS < 0 || frame.timeInMS >= frame.duration) {
            if (sound.isPlaying) {
                sound.stop();
            }
        } else {
            if (!sound.isPlaying) {
                void sound.play({ start: frame.timeInMS / 1000 });
            }
        }
    });

    const onPreviewPause = useCallbackRef(() => {
        sound?.stop();
    });

    useEffect(() => {
        previewController.on('play', onPreviewPlay);
        previewController.on('seek', onPreviewSeek);
        previewController.on('tick', onPreviewTick);
        previewController.on('pause', onPreviewPause);

        return () => {
            previewController.off('play', onPreviewPlay);
            previewController.off('seek', onPreviewSeek);
            previewController.off('tick', onPreviewTick);
            previewController.off('pause', onPreviewPause);
        };
    }, [previewController, onPreviewPlay, onPreviewSeek, onPreviewPause, onPreviewTick]);

    return <></>;
}
