import { Frame } from '../../model/frame/Frame';
import { PreviewPlayerController } from '../../service/PreviewPlayerController';

export interface PreviewPlayerObjectViewProps<T extends Frame> {
    frame: T;
    previewController: PreviewPlayerController;
}
