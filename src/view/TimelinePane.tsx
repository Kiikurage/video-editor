import * as React from 'react';
import styled from 'styled-components';
import { Pane } from './Pane';
import { TimeLine } from './TimeLine/TimeLine';
import { TimelinePaneToolBar } from './TimelinePaneToolBar';

const Base = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;

    &:nth-child(0) {
        flex: 0 0 auto;
    }
    &:nth-child(1) {
        flex: 1 1 0;
    }
`;

export function TimelinePane(): React.ReactElement {
    return (
        <Pane title="タイムライン" tabPosition="bottom">
            <Base>
                <TimelinePaneToolBar />
                <TimeLine />
            </Base>
        </Pane>
    );
}
