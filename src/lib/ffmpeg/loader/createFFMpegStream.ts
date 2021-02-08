import { BaseObject } from '../../../model/objects/BaseObject';
import { Project } from '../../../model/Project';
import { FFMpegStreamMap } from '../stream/FFMpegStream';

export type createFFMpegStream<T extends BaseObject> = (
    object: T,
    streamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => Promise<FFMpegStreamMap>;
