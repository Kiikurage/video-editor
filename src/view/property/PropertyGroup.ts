import styled from 'styled-components';

export const PropertyGroup = styled.div`
    padding: 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    justify-content: stretch;

    & + & {
        border-top: 1px solid #d0d0d0;
    }
`;

export const PropertyGroupName = styled.header`
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: #888;
    line-height: 1;
`;

export const PropertyRow = styled.div`
    display: grid;
    gap: 8px;

    > * {
        grid-row: 1;
        flex: 1 1 0;
    }
`;

export const PropertyColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    flex: 1 1 0;
`;
