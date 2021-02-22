import PIXISound from 'pixi-sound';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

export function AudioObjectView(props: PreviewPlayerObjectViewProps<AudioObject>): React.ReactElement {
    const { object, previewController } = props;

    const [sound, setSound] = useState<PIXISound.Sound | null>(null);
    useEffect(() => {
        setSound(
            PIXISound.Sound.from({
                url: object.srcFilePath,
                preload: true,
                autoPlay: false,
            })
        );
    }, [object.srcFilePath]);

    useEffect(() => {
        if (sound === null) return;
        sound.volume = AnimatableValue.interpolate(object.volume, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    }, [object.endInMS, object.startInMS, object.volume, previewController.currentTimeInMS, sound]);

    const onPreviewPlay = useCallbackRef(() => {
        if (previewController.currentTimeInMS < object.startInMS || previewController.currentTimeInMS >= object.endInMS) {
            return;
        }
        void sound?.play({ start: (previewController.currentTimeInMS - object.startInMS) / 1000 });
    });

    const onPreviewSeek = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (previewController.currentTimeInMS < object.startInMS || previewController.currentTimeInMS >= object.endInMS) {
            sound.stop();
        } else {
            sound.stop();
            void sound.play({
                start: (previewController.currentTimeInMS - object.startInMS) / 1000,
            });
        }
    });

    const onPreviewTick = useCallbackRef(() => {
        if (!sound) return;
        if (previewController.paused) return;

        if (previewController.currentTimeInMS < object.startInMS || previewController.currentTimeInMS >= object.endInMS) {
            if (sound.isPlaying) {
                sound.stop();
            }
        } else {
            if (!sound.isPlaying) {
                void sound.play({
                    start: (previewController.currentTimeInMS - object.startInMS) / 1000,
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
