import * as React from 'react';
import styled from 'styled-components';

const Base = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
`;

const Header = styled.header`
    font-size: 12px;
    color: #666;
`;

interface Props {
    label?: string;
}

export function FormControl(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { label, children } = props;

    return (
        <Base>
            {label !== undefined && <Header>{label}</Header>}
            <div>{children}</div>
        </Base>
    );
}
