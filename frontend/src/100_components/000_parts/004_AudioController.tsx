import React, { Suspense, useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { AudioOutputElementId, generateWavNameForLocalStorage } from "../../const";

const enabledButtonClass = "audio-controller-button";
const disabledButtonClass = "audio-controller-button-disabled";
const activeButtonClass = "audio-controller-button-active";
type ButtonStates = {
    recordButtonClass: string;
    stopButtonClass: string;
    playButtonClass: string;
    keepButtonClass: string;
    recordAction: () => void;
    stopAction: () => void;
    playAction: () => void;
    keepAction: () => void;
};

export const AudioController = () => {
    const { audioControllerState, mediaRecorderState } = useAppState();

    const { recordButton, stopButton, playButton, keepButton } = useMemo(() => {
        const buttonStates: ButtonStates = {
            recordButtonClass: "",
            stopButtonClass: "",
            playButtonClass: "",
            keepButtonClass: "",
            recordAction: () => {},
            stopAction: () => {},
            playAction: () => {},
            keepAction: () => {},
        };
        switch (audioControllerState.audioControllerState) {
            case "stop":
                buttonStates.recordButtonClass = enabledButtonClass;
                buttonStates.stopButtonClass = activeButtonClass;
                buttonStates.playButtonClass = enabledButtonClass;
                buttonStates.keepButtonClass = enabledButtonClass;
                buttonStates.recordAction = () => {
                    audioControllerState.setAudioControllerState("record");
                    mediaRecorderState.startRecord();
                };
                buttonStates.playAction = () => {
                    audioControllerState.setAudioControllerState("play");
                    const audioElem = document.getElementById(AudioOutputElementId) as HTMLAudioElement;
                    audioElem.src = audioControllerState.tmpMicWavURL;
                    audioElem.play();
                };
                buttonStates.keepAction = () => {};
                break;
            case "record":
                buttonStates.recordButtonClass = activeButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass;
                buttonStates.playButtonClass = disabledButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.stopAction = () => {
                    audioControllerState.setAudioControllerState("stop");
                    mediaRecorderState.pauseRecord();
                    const { micWavURL, vfWavURL } = mediaRecorderState.getRecordedDataURL();
                    audioControllerState.setTmpMicWavURL(micWavURL);
                    audioControllerState.setTmpVfWavURL(vfWavURL);
                };
                break;

            case "play":
                buttonStates.recordButtonClass = disabledButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass;
                buttonStates.playButtonClass = activeButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.stopAction = () => {
                    audioControllerState.setAudioControllerState("stop");
                };
                break;
        }
        const recordButton = (
            <div className={buttonStates.recordButtonClass} onClick={buttonStates.recordAction}>
                record
            </div>
        );
        const stopButton = (
            <div className={buttonStates.stopButtonClass} onClick={buttonStates.stopAction}>
                stop
            </div>
        );
        const playButton = (
            <div className={buttonStates.playButtonClass} onClick={buttonStates.playAction}>
                play
            </div>
        );
        const keepButton = (
            <div className={buttonStates.keepButtonClass} onClick={buttonStates.keepAction}>
                keep
            </div>
        );

        return { recordButton, stopButton, playButton, keepButton };
    }, [audioControllerState.audioControllerState]);

    return (
        <div className="audio-controller-button-container">
            {recordButton} {stopButton} {playButton} {keepButton}
        </div>
    );
};
