import * as React from 'react';
import styled from 'styled-components';
import { BaseObject } from '../model/BaseObject';

interface Props {
    object: BaseObject | null;
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
    const { object } = props;

    return (
        <Base>
            {object !== null && (
                <>
                    <AttributeRow>
                        <AttributeName>開始</AttributeName>
                        <input type="number" min={0} defaultValue={object.startInMS} />
                    </AttributeRow>
                    <AttributeRow>
                        <AttributeName>終了</AttributeName>
                        <input type="number" min={0} defaultValue={object.endInMS} />
                    </AttributeRow>
                    {/*<AttributeRow>*/}
                    {/*    <AttributeName>内容</AttributeName>*/}
                    {/*    <textarea>{object.text}</textarea>*/}
                    {/*</AttributeRow>*/}
                </>
            )}
        </Base>
    );
}
