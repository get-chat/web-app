import React from 'react';
import { AppConfig } from '@src/config/application';

const AppConfigContext = React.createContext<AppConfig | null>(null);

export { AppConfigContext };
