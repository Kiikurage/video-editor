import { PreviewCanvasViewportInfo } from '../PreviewPlayer/PreviewPlayer';

export interface RendererProps<T> {
    object: T;
    canvasContext: PreviewCanvasViewportInfo;
    timeInMS: number;
}
