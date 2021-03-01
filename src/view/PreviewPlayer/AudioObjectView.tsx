import PIXISound from 'pixi-sound';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AudioFrame } from '../../model/frame/AudioFrame';
import { useAppController } from '../AppControllerProvider';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

export function AudioObjectView(props: PreviewPlayerObjectViewProps<AudioFrame>): React.ReactElement {
    const { frame } = props;
    const appController = useAppController();

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
        if (appController.paused) return;

        if (frame.timeInMS < 0 || frame.timeInMS >= frame.duration) {
            sound.stop();
        } else {
            sound.stop();
            void sound.play({ start: frame.timeInMS / 1000 });
        }
    });

    const onPreviewTick = useCallbackRef(() => {
        if (!sound) return;
        if (appController.paused) return;

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
        appController.on('play', onPreviewPlay);
        appController.on('seek', onPreviewSeek);
        appController.on('tick', onPreviewTick);
        appController.on('pause', onPreviewPause);

        return () => {
            appController.off('play', onPreviewPlay);
            appController.off('seek', onPreviewSeek);
            appController.off('tick', onPreviewTick);
            appController.off('pause', onPreviewPause);
        };
    }, [appController, onPreviewPlay, onPreviewSeek, onPreviewPause, onPreviewTick]);

    return <></>;
}
