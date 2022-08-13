import e from "express";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { AudioOutputElementId, generateWavNameForLocalStorage } from "../../const";

const enabledButtonClass = "audio-controller-button";
const disabledButtonClass = "audio-controller-button-disabled";
const activeButtonClass = "audio-controller-button-active";
const attentionButtonClass = "audio-controller-button-attention";
type ButtonStates = {
    recordButtonClass: string;
    stopButtonClass: string;
    playButtonClass: string;
    keepButtonClass: string;
    dismissButtonClass: string;
    recordAction: () => void;
    stopAction: () => void;
    playAction: () => void;
    keepAction: () => void;
    dismissAction: () => void;
};

export const AudioController = () => {
    const { audioControllerState, mediaRecorderState, frontendState, corpusDataState } = useAppState();

    const loadStoredRecord = (corpusTitle: string | undefined, index: number) => {
        if (!corpusTitle) {
            audioControllerState.setTmpMicWavBlob(undefined);
            audioControllerState.setTmpVfWavBlob(undefined);
            return;
        }
        const { micBlob, vfBlob } = corpusDataState.getWavBlob(corpusTitle, index);
        audioControllerState.setTmpMicWavBlob(micBlob);
        audioControllerState.setTmpVfWavBlob(vfBlob);
    };
    useEffect(() => {
        loadStoredRecord(frontendState.targetCorpusTitle, frontendState.targetTextIndex);
    }, [frontendState.targetTextIndex, frontendState.targetCorpusTitle]);

    const { recordButton, stopButton, playButton, keepButton, dismissButton } = useMemo(() => {
        const buttonStates: ButtonStates = {
            recordButtonClass: "",
            stopButtonClass: "",
            playButtonClass: "",
            keepButtonClass: "",
            dismissButtonClass: "",

            recordAction: () => {},
            stopAction: () => {},
            playAction: () => {},
            keepAction: () => {},
            dismissAction: () => {},
        };
        switch (audioControllerState.audioControllerState) {
            case "stop":
                buttonStates.recordButtonClass = enabledButtonClass; // [action needed]
                buttonStates.stopButtonClass = activeButtonClass;
                if (audioControllerState.tmpVfWavBlob) {
                    buttonStates.playButtonClass = enabledButtonClass; // [action needed]
                } else {
                    buttonStates.playButtonClass = disabledButtonClass;
                }
                if (audioControllerState.unsavedRecord) {
                    {
                        // セーブされていない新録がある場合。
                        buttonStates.keepButtonClass = attentionButtonClass; // [action needed]
                        buttonStates.dismissButtonClass = attentionButtonClass; // [action needed]
                    }
                } else {
                    buttonStates.keepButtonClass = disabledButtonClass;
                    buttonStates.dismissButtonClass = disabledButtonClass;
                }

                buttonStates.recordAction = () => {
                    audioControllerState.setAudioControllerState("record");
                    mediaRecorderState.startRecord();
                };
                if (audioControllerState.tmpVfWavBlob) {
                    // バッファ上に音声がある場合。（ローカルストレージ、新録両方。）
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
                }
                if (audioControllerState.unsavedRecord) {
                    // セーブされていない新録がある場合。
                    buttonStates.keepAction = () => {
                        corpusDataState.setWavBlob(frontendState.targetCorpusTitle!, frontendState.targetTextIndex, audioControllerState.tmpMicWavBlob, audioControllerState.tmpVfWavBlob);
                        audioControllerState.setUnsavedRecord(false);
                    };
                    buttonStates.dismissAction = () => {
                        audioControllerState.setUnsavedRecord(false);
                        loadStoredRecord(frontendState.targetCorpusTitle, frontendState.targetTextIndex);
                    };
                }
                break;
            case "record":
                buttonStates.recordButtonClass = activeButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass; // [action needed]
                buttonStates.playButtonClass = disabledButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.dismissButtonClass = disabledButtonClass;
                buttonStates.stopAction = () => {
                    audioControllerState.setAudioControllerState("stop");
                    mediaRecorderState.pauseRecord();
                    const { micWavBlob, vfWavBlob } = mediaRecorderState.getRecordedDataBlobs();
                    audioControllerState.setTmpMicWavBlob(micWavBlob);
                    audioControllerState.setTmpVfWavBlob(vfWavBlob);
                    audioControllerState.setUnsavedRecord(true);
                };
                break;

            case "play":
                buttonStates.recordButtonClass = disabledButtonClass;
                buttonStates.stopButtonClass = enabledButtonClass; // [action needed]
                buttonStates.playButtonClass = activeButtonClass;
                buttonStates.keepButtonClass = disabledButtonClass;
                buttonStates.dismissButtonClass = disabledButtonClass;
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
        const dismissButton = (
            <div className={buttonStates.dismissButtonClass} onClick={buttonStates.dismissAction}>
                dismiss
            </div>
        );

        return { recordButton, stopButton, playButton, keepButton, dismissButton };
    }, [audioControllerState.audioControllerState, audioControllerState.tmpMicWavBlob, audioControllerState.tmpVfWavBlob, frontendState.targetCorpusTitle, frontendState.targetTextIndex, mediaRecorderState.startRecord, mediaRecorderState.pauseRecord]);

    return (
        <div className="audio-controller-button-container">
            {recordButton} {stopButton} {playButton} {keepButton} {dismissButton}
        </div>
    );
};
