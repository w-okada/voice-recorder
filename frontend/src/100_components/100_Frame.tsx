import React, { useEffect } from "react";
import { AudioOutputElementId } from "../const";
import { useAppState } from "../003_provider/AppStateProvider";

// export class CustomedDeviceController extends DefaultDeviceController {
//     private static audioContext2: AudioContext | null = null;
//     static getAudioContext(): AudioContext {
//         if (!CustomedDeviceController.audioContext2) {
//             console.log("GET_AUDIO_CONTEXT");
//             const options: AudioContextOptions = {};
//             options.sampleRate = 44100;
//             // @ts-ignore
//             CustomedDeviceController.audioContext2 = new (window.AudioContext || window.webkitAudioContext)(options);
//         }
//         return CustomedDeviceController.audioContext2;
//     }
// }

export const Frame = () => {
    const { deviceManagerState, mediaRecorderState } = useAppState();

    useEffect(() => {
        if (deviceManagerState.audioInputDevices.length === 0) {
            return;
        }
        const mic = deviceManagerState.audioInputDevices[0];
        console.log("MIC1: ", mic);
        deviceManagerState.setAudioInputDeviceId(mic.deviceId);
    }, [deviceManagerState.audioInputDevices]);
    // console.log("SAMPLE RATE", audioContext.sampleRate);
    return (
        <div>
            <audio src="" id={AudioOutputElementId}></audio>
            <div
                onClick={() => {
                    mediaRecorderState.startRecord();
                }}
                style={{ color: "#f00" }}
            >
                start
            </div>
            <div
                onClick={() => {
                    mediaRecorderState.pauseRecord();
                    mediaRecorderState.getRecordedData();
                }}
            >
                stop
            </div>
        </div>
    );
};
