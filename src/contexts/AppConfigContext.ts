import { createContext } from 'react';
import { AppConfig } from '@src/config/application';

const AppConfigContext = createContext<AppConfig | null>(null);

export { AppConfigContext };
