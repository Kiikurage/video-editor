import * as React from 'react';
import styled from 'styled-components';

const Base = styled.div<{ tabPosition: 'left' | 'right' | 'bottom' }>`
    background: #fff;
    display: grid;
    grid-template: ${(props) => {
        switch (props.tabPosition) {
            case 'left':
                return '"header body" 1fr / min-content 1fr';

            case 'right':
                return '"body header" 1fr / 1fr min-content';

            case 'bottom':
                return '"body" 1fr\n"header" min-content / 1fr';
        }
    }};
    width: 100%;
    height: 100%;
`;

// const Header = styled.header<{ tabPosition: 'left' | 'right' | 'bottom' }>`
//     grid-area: header;
//     display: flex;
//     font-size: 12px;
//     box-sizing: border-box;
//     background: #e0e0e0;
//     color: #707070;
//     white-space: nowrap;
//     line-height: 1;
//
//     ${(props) => {
//         switch (props.tabPosition) {
//             case 'left':
//                 return css`
//                     flex-direction: column;
//                     align-items: flex-end;
//                     justify-content: center;
//                     writing-mode: vertical-lr;
//                     text-orientation: sideways;
//                     width: 30px;
//                     height: 100%;
//                     padding: 16px 0;
//                     transform: rotateZ(180deg);
//                     border-left: 1px solid #d0d0d0;
//                 `;
//             case 'right':
//                 return css`
//                     flex-direction: column;
//                     align-items: flex-start;
//                     justify-content: center;
//                     writing-mode: vertical-lr;
//                     text-orientation: sideways;
//                     width: 30px;
//                     height: 100%;
//                     padding: 16px 0;
//                     border-left: 1px solid #d0d0d0;
//                 `;
//             case 'bottom':
//                 return css`
//                     flex-direction: row;
//                     align-items: center;
//                     justify-content: flex-start;
//                     height: 30px;
//                     width: 100%;
//                     padding: 0 16px;
//                     border-top: 1px solid #d0d0d0;
//                 `;
//         }
//     }}
// `;

const Body = styled.div`
    grid-area: body;
    position: relative;
`;

interface Props {
    title: string;
    tabPosition: 'left' | 'right' | 'bottom';
}

export function Pane(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { title: _title, tabPosition, children } = props;
    return (
        <Base tabPosition={tabPosition}>
            {/*<Header tabPosition={tabPosition}>{title}</Header>*/}
            <Body>{children}</Body>
        </Base>
    );
}
