import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './view/App';
import { AppControllerProvider } from './view/AppControllerProvider';

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <AppControllerProvider>
            <App />
        </AppControllerProvider>,
        document.getElementById('root')
    );
});
