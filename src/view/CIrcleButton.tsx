import styled from 'styled-components';

export const CircleButton = styled.button`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 24px;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.1);
    }
`;
