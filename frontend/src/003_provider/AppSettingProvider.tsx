import React, { useContext } from "react";
import { ReactNode } from "react";
import { ApplicationSetting } from "../001_clients_and_managers/000_ApplicationSettingLoader";
import { useApplicationSettingManager } from "../002_hooks/000_useApplicationSettingManager";
import { IndexedDBStateAndMethod, useIndexedDB } from "../002_hooks/000_useIndexedDB";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/001_useDeviceManager";

type Props = {
    children: ReactNode;
};

type AppSettingValue = {
    applicationSetting: ApplicationSetting | null;
    indexedDBState: IndexedDBStateAndMethod;
    deviceManagerState: DeviceManagerStateAndMethod;
};

const AppSettingContext = React.createContext<AppSettingValue | null>(null);
export const useAppSetting = (): AppSettingValue => {
    const state = useContext(AppSettingContext);
    if (!state) {
        throw new Error("useAppSetting must be used within AppSettingProvider");
    }
    return state;
};

export const AppSettingProvider = ({ children }: Props) => {
    const { applicationSetting } = useApplicationSettingManager();
    const indexedDBState = useIndexedDB();
    const deviceManagerState = useDeviceManager();

    const providerValue = {
        applicationSetting,
        indexedDBState,
        deviceManagerState,
    };
    return <AppSettingContext.Provider value={providerValue}>{children}</AppSettingContext.Provider>;
};
