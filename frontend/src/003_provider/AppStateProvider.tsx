import React, { useContext, useEffect } from "react";
import { ReactNode } from "react";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/001_useDeviceManager";
import { MediaRecorderStateAndMethod, useMediaRecorder } from "../002_hooks/002_useMediaRecorder";
import { AudioOutputElementId } from "../const";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    deviceManagerState: DeviceManagerStateAndMethod;
    mediaRecorderState: MediaRecorderStateAndMethod;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);
export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    const deviceManagerState = useDeviceManager({
        outputAudioElementId: AudioOutputElementId,
    });
    const mediaRecorderState = useMediaRecorder();

    useEffect(() => {
        if (!deviceManagerState.audioInputDeviceId) {
            console.log("audioInput device is not initialized");
            return;
        }
        if (deviceManagerState.audioInputDevices.length === 0) {
            console.log("audioInput device list is not initialized");
            return;
        }

        console.log("audioInput device", deviceManagerState.audioInputDeviceId);
        mediaRecorderState.setNewAudioInputDevice(deviceManagerState.audioInputDeviceId);
    }, [deviceManagerState.audioInputDeviceId, deviceManagerState.audioInputDevices]);

    const providerValue = {
        deviceManagerState,
        mediaRecorderState,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
