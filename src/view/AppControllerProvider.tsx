import * as React from 'react';
import { useContext, useState } from 'react';
import { AppController } from '../service/AppController';

const context = React.createContext<AppController>(null as never);

export function useAppController(): AppController {
    return useContext(context);
}

export function AppControllerProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
    const { children } = props;
    const [appController, _setAppController] = useState(() => {
        return new AppController();
    });

    return <context.Provider value={appController}>{children}</context.Provider>;
}
