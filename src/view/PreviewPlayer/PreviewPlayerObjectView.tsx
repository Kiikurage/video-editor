import { Frame } from '../../model/frame/Frame';
import { PreviewController } from '../../service/PreviewController';

export interface PreviewPlayerObjectViewProps<T extends Frame> {
    frame: T;
    previewController: PreviewController;
}
