import PIXISound from 'pixi-sound';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AudioObject } from '../../../model/objects/AudioObject';
import { PreviewController } from '../../../service/PreviewController';
import { useCallbackRef } from '../../hooks/useCallbackRef';

interface Props {
    audio: AudioObject;
    previewController: PreviewController;
}

export function AudioObjectView(props: Props): React.ReactElement {
    const { audio, previewController } = props;

    const [sound, setSound] = useState<PIXISound.Sound | null>(null);
    useEffect(() => {
        setSound(
            PIXISound.Sound.from({
                url: audio.srcFilePath,
                preload: true,
                autoPlay: false,
            })
        );
    }, [audio.srcFilePath]);

    useEffect(() => {
        if (sound === null) return;

        sound.volume = audio.volume;
    }, [sound, audio.volume]);

    const onPreviewPlay = useCallbackRef(() => {
        if (previewController.currentTimeInMS < audio.startInMS || previewController.currentTimeInMS >= audio.endInMS) {
            return;
        }
        void sound?.play({ start: (previewController.currentTimeInMS - audio.startInMS) / 1000 });
    });

    const onPreviewSeek = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (previewController.currentTimeInMS < audio.startInMS || previewController.currentTimeInMS >= audio.endInMS) {
            sound.stop();
        } else {
            sound.stop();
            void sound.play({
                start: (previewController.currentTimeInMS - audio.startInMS) / 1000,
            });
        }
    });

    const onPreviewTick = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (previewController.currentTimeInMS < audio.startInMS || previewController.currentTimeInMS >= audio.endInMS) {
            if (sound.isPlaying) {
                sound.stop();
            }
        } else {
            if (!sound.isPlaying) {
                void sound.play({
                    start: (previewController.currentTimeInMS - audio.startInMS) / 1000,
                });
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
