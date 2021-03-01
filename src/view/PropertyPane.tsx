import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { AudioObject } from '../model/objects/AudioObject';
import { ImageObject } from '../model/objects/ImageObject';
import { ShapeObject } from '../model/objects/ShapeObject';
import { TextObject } from '../model/objects/TextObject';
import { VideoObject } from '../model/objects/VideoObject';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useForceUpdate } from './hooks/useForceUpdate';
import { Pane } from './Pane';
import { AudioPropertyGroup } from './property/AudioPropertyGroup';
import { BasePropertyGroup } from './property/BasePropertyGroup';
import { FontStylePropertyGroup } from './property/FontStylePropertyGroup';
import { PositionPropertyGroup } from './property/PositionPropertyGroup';
import { ProjectPropertyGroup } from './property/ProjectPropertyGroup';
import { ShapePropertyGroup } from './property/ShapePropertyGroup';
import { SrcFilePropertyGroup } from './property/SrcFilePropertyGroup';
import { TextPropertyGroup } from './property/TextPropertyGroup';

const Base = styled.div`
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    min-width: 200px;
    overflow-y: auto;
    overflow-x: auto;
`;

const Body = styled.div`
    overflow: auto;
    flex: 1 1 0;
`;

const ObjectSummary = styled.div`
    padding: 16px 16px;
`;

const Footer = styled.footer`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 16px 16px;
    border-top: 1px solid #c0c0c0;
`;

const DeleteButton = styled.button`
    flex: 1;
    padding: 0 16px;
    line-height: 40px;
    background: #c00;
    color: #fff;
    border: none;
    cursor: pointer;
`;

export function PropertyPane(): React.ReactElement {
    const appController = useAppController();

    const forceUpdate = useForceUpdate();
    useEffect(() => {
        appController.on('change', forceUpdate);
        appController.on('selectionchange', forceUpdate);

        return () => {
            appController.off('change', forceUpdate);
            appController.off('selectionchange', forceUpdate);
        };
    }, [appController, forceUpdate]);

    const project = appController.project;
    const selectedObjects = appController.selectedObjects;

    const onObjectRemove = useCallbackRef(() => {
        if (selectedObject !== null) {
            appController.commitHistory(() => {
                appController.removeObject(selectedObject.id);
            });
        }
    });

    if (selectedObjects.size >= 2) {
        return (
            <Base>
                <Body>
                    <ObjectSummary>複数のオブジェクトを選択中</ObjectSummary>
                </Body>
            </Base>
        );
    }

    const selectedObject = selectedObjects.size === 0 ? null : [...selectedObjects][0];

    return (
        <Pane title="オブジェクトの詳細" tabPosition="right">
            <Base>
                <Body>
                    <ObjectSummary>
                        {selectedObject === null ? <div>PROJECT</div> : <div>{selectedObject.constructor.name}</div>}
                    </ObjectSummary>

                    {selectedObject === null ? <ProjectPropertyGroup project={project} /> : <BasePropertyGroup object={selectedObject} />}

                    {selectedObject !== null &&
                        (selectedObject instanceof ShapeObject ||
                            selectedObject instanceof VideoObject ||
                            selectedObject instanceof TextObject ||
                            selectedObject instanceof ImageObject) && <PositionPropertyGroup object={selectedObject} />}
                    {selectedObject !== null && selectedObject instanceof TextObject && <FontStylePropertyGroup object={selectedObject} />}
                    {selectedObject !== null && selectedObject instanceof TextObject && <TextPropertyGroup object={selectedObject} />}
                    {selectedObject !== null && selectedObject instanceof AudioObject && <AudioPropertyGroup object={selectedObject} />}
                    {selectedObject !== null &&
                        (selectedObject instanceof AudioObject ||
                            selectedObject instanceof VideoObject ||
                            selectedObject instanceof ImageObject) && <SrcFilePropertyGroup object={selectedObject} />}
                    {selectedObject !== null && selectedObject instanceof ShapeObject && <ShapePropertyGroup object={selectedObject} />}
                </Body>

                {selectedObject !== null && (
                    <Footer>
                        <DeleteButton onClick={onObjectRemove}>削除</DeleteButton>
                    </Footer>
                )}
            </Base>
        </Pane>
    );
}
