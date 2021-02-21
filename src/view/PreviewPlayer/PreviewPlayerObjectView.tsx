import * as PIXI from 'pixi.js';
import { BaseObject } from '../../model/objects/BaseObject';
import { PreviewController } from '../../service/PreviewController';

export interface PreviewPlayerObjectViewProps<T extends BaseObject> {
    object: T;
    selected: boolean;
    previewController: PreviewController;
    onSelect: (ev: PIXI.InteractionEvent) => void;
    onChange: (dx: number, dy: number, dw: number, dh: number) => void;
}
