import * as React from 'react';
import { useState } from 'react';
import { AppController } from '../service/AppController';
import { createContext2, useContext2 } from './hooks/useContext2';

const context = createContext2<AppController>();

export function useAppController(): AppController {
    return useContext2(context);
}

export function AppControllerProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
    const { children } = props;
    const [appController, _setAppController] = useState(() => {
        return new AppController();
    });

    return <context.Provider value={appController}>{children}</context.Provider>;
}
