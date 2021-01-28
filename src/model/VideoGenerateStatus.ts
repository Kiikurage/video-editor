interface VideoGenerateRunningStatus {
    type: 'RUNNING';
}

interface VideoGenerateSuccessStatus {
    type: 'SUCCESS';
}

interface VideoGenerateFailedStatus {
    type: 'FAILED';
    error: Error;
}

export type VideoGenerateStatus = VideoGenerateRunningStatus | VideoGenerateSuccessStatus | VideoGenerateFailedStatus;
