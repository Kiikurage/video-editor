import * as React from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';

interface Props {
    node: Caption | null;
}

const Base = styled.div``;

const AttributeRow = styled.div`
    padding: 8px 32px;
`;

const AttributeName = styled.div`
    font-size: 12px;
    color: #444;
`;

export function PropertyView(props: Props): React.ReactElement {
    const { node } = props;

    return (
        <Base>
            {node !== null && (
                <>
                    <AttributeRow>
                        <AttributeName>開始</AttributeName>
                        <input type="number" min={0} defaultValue={node.startInMS} />
                    </AttributeRow>
                    <AttributeRow>
                        <AttributeName>終了</AttributeName>
                        <input type="number" min={0} defaultValue={node.endInMS} />
                    </AttributeRow>
                    <AttributeRow>
                        <AttributeName>内容</AttributeName>
                        <textarea>{node.text}</textarea>
                    </AttributeRow>
                </>
            )}
        </Base>
    );
}
