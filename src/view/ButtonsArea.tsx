// import * as React from 'react';
// import { useState } from 'react';
// import styled from 'styled-components';
// import { Caption } from '../model/Caption';
// import { VideoGenerateStatus } from '../model/VideoGenerateStatus';
// import { OutputBuilder } from '../service/OutputBuilder';
//
// interface Props {
//     captionList: ReadonlyArray<Caption>;
// }
//
// export function ButtonsArea(props: Props) {
//     const { captionList } = props;
//
//     const [videoGenerateStatus, setVideoGenerateStatus] = useState<VideoGenerateStatus | null>(null);
//
//     const onExportButtonClick = async () => {
//         const outputBuilder = new OutputBuilder()
//             .setInputVideoPath('./src/static/video.mp4')
//             .setCaptionList(captionList)
//             .setOutputVideoPath('./output.mp4');
//
//         try {
//             setVideoGenerateStatus({ type: 'RUNNING' });
//             await outputBuilder.build();
//         } catch (err) {
//             console.error('Failed to run ffmpeg', err);
//             setVideoGenerateStatus({ type: 'FAILED', error: err });
//             // TODO: クリーンアップされず永遠にゴミが残る
//             return;
//         }
//         //
//         // cleanUpWorkspace();
//         setVideoGenerateStatus({ type: 'SUCCESS' });
//     };
//
//     return (
//         <div>
//             <div>
//                 <button onClick={onExportButtonClick} disabled={videoGenerateStatus?.type === 'RUNNING'}>
//                     動画出力
//                 </button>
//
//                 <VideoGenerateStatusMessageContainer>
//                 {(videoGenerateStatus?.type === 'RUNNING') && (
//                     <RunningMessage>出力中</RunningMessage>
//                 )}
//                 {(videoGenerateStatus?.type === 'SUCCESS') && (
//                     <SuccessMessage>動画が正常に出力されました</SuccessMessage>
//                 )}
//                 {(videoGenerateStatus?.type === 'FAILED') && (
//                     <FailedMessage>動画の出力に失敗しました</FailedMessage>
//                 )}
//                 </VideoGenerateStatusMessageContainer>
//             </div>
//
//             {(videoGenerateStatus?.type === 'FAILED') && (
//                 <FailedMessage>
//                     <textarea readOnly>{videoGenerateStatus.error.message}</textarea>
//                 </FailedMessage>
//             )}
//         </div>
//     );
// }
//
//
// const VideoGenerateStatusMessageContainer = styled.span`
//     margin-left: 16px;
// `;
//
// const RunningMessage = styled.span`
//   font-size: 0.75em;
// `;
//
// const SuccessMessage = styled.span`
//   color: #080;
//   font-size: 0.75em;
// `;
//
// const FailedMessage = styled.span`
//   color: #c00;
//   font-size: 0.75em;
// `;
