import React, { useContext, useEffect } from "react";
import { ReactNode } from "react";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/001_useDeviceManager";
import { MediaRecorderStateAndMethod, useMediaRecorder } from "../002_hooks/002_useMediaRecorder";
import { CorpusDataStateAndMethod, useCorpusData } from "../002_hooks/003_useCorpusData";
import { AudioControllerStateAndMethod, useAudioControllerState } from "../002_hooks/004_useAudioControllerState";
import { useWaveSurfer, WaveSurferStateAndMethod } from "../002_hooks/005_useWaveSurfer";
import { FrontendStateAndMethod, useFrontendState } from "../002_hooks/100_useFrontendState";
import { AudioOutputElementId } from "../const";
import { useAppSetting } from "./AppSettingProvider";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    deviceManagerState: DeviceManagerStateAndMethod;
    mediaRecorderState: MediaRecorderStateAndMethod;
    corpusDataState: CorpusDataStateAndMethod;
    frontendState: FrontendStateAndMethod;
    audioControllerState: AudioControllerStateAndMethod;
    waveSurferState: WaveSurferStateAndMethod;
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
    const { deviceManagerState } = useAppSetting();
    const mediaRecorderState = useMediaRecorder();
    const corpusDataState = useCorpusData();
    const frontendState = useFrontendState();
    const audioControllerState = useAudioControllerState();
    const waveSurferState = useWaveSurfer();

    useEffect(() => {
        if (!deviceManagerState.audioInputDeviceId) {
            console.log("audioInput device is not initialized");
            return;
        }
        if (deviceManagerState.audioInputDevices.length === 0) {
            console.log("audioInput device list is not initialized");
            return;
        }
        mediaRecorderState.setNewAudioInputDevice(deviceManagerState.audioInputDeviceId);
    }, [deviceManagerState.audioInputDeviceId, deviceManagerState.audioInputDevices]);

    useEffect(() => {}, []);

    const providerValue = {
        deviceManagerState,
        mediaRecorderState,
        corpusDataState,
        frontendState,
        audioControllerState,
        waveSurferState,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
