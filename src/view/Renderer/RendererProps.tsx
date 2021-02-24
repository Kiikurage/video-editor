import { Frame } from '../../model/frame/Frame';

export interface RendererProps<T extends Frame> {
    frame: T;
}
