import React, { Suspense, useEffect, useMemo, useState } from "react";
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
    const { audioControllerState, mediaRecorderState, frontendState, corpusDataState } = useAppState();

    useEffect(() => {
        if (!frontendState.targetCorpusTitle) {
            audioControllerState.setTmpMicWavBlob(undefined);
            audioControllerState.setTmpVfWavBlob(undefined);
            return;
        }
        const { micBlob, vfBlob } = corpusDataState.getWavBlob(frontendState.targetCorpusTitle, frontendState.targetTextIndex);
        audioControllerState.setTmpMicWavBlob(micBlob);
        audioControllerState.setTmpVfWavBlob(vfBlob);
    }, [frontendState.targetTextIndex, frontendState.targetCorpusTitle]);

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
                if (audioControllerState.tmpVfWavBlob) {
                    buttonStates.playButtonClass = enabledButtonClass;
                    buttonStates.keepButtonClass = enabledButtonClass;
                } else {
                    buttonStates.playButtonClass = disabledButtonClass;
                    buttonStates.keepButtonClass = disabledButtonClass;
                }
                buttonStates.recordAction = () => {
                    audioControllerState.setAudioControllerState("record");
                    mediaRecorderState.startRecord();
                };
                if (audioControllerState.tmpVfWavBlob) {
                    buttonStates.playAction = () => {
                        audioControllerState.setAudioControllerState("play");
                        const audioElem = document.getElementById(AudioOutputElementId) as HTMLAudioElement;
                        audioElem.onended = () => {
                            audioControllerState.setAudioControllerState("stop");
                        };
                        audioElem.src = URL.createObjectURL(audioControllerState.tmpVfWavBlob!);
                        audioElem.currentTime = 0;

                        audioElem.play();
                    };
                    buttonStates.keepAction = () => {
                        corpusDataState.setWavBlob(frontendState.targetCorpusTitle!, frontendState.targetTextIndex, audioControllerState.tmpMicWavBlob, audioControllerState.tmpVfWavBlob);
                    };
                }
                break;
            case "record":
                buttonStates.recordButtonClass = activeButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass;
                buttonStates.playButtonClass = disabledButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.stopAction = () => {
                    audioControllerState.setAudioControllerState("stop");
                    mediaRecorderState.pauseRecord();
                    const { micWavBlob, vfWavBlob } = mediaRecorderState.getRecordedDataBlobs();
                    audioControllerState.setTmpMicWavBlob(micWavBlob);
                    audioControllerState.setTmpVfWavBlob(vfWavBlob);
                };
                break;

            case "play":
                buttonStates.recordButtonClass = disabledButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass;
                buttonStates.playButtonClass = activeButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.stopAction = () => {
                    const audioElem = document.getElementById(AudioOutputElementId) as HTMLAudioElement;
                    audioElem.pause();
                    audioElem.currentTime = 0;
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
    }, [audioControllerState.audioControllerState, audioControllerState.tmpMicWavBlob, audioControllerState.tmpVfWavBlob, frontendState.targetCorpusTitle, frontendState.targetTextIndex, mediaRecorderState.startRecord, mediaRecorderState.pauseRecord]);

    return (
        <div className="audio-controller-button-container">
            {recordButton} {stopButton} {playButton} {keepButton}
        </div>
    );
};
