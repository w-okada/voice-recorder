import React, { useEffect } from "react";
import { AudioOutputElementId } from "../const";
import { useAppState } from "../003_provider/AppStateProvider";
import { DeviceSelector } from "./000_parts/001_DeviceSelector";
import { CorpusSelector } from "./000_parts/002_CorpusSelector";
import { RecorderCardContainer } from "./000_parts/010-1_RecoderCardContainer";
import { TextIndexSelector } from "./000_parts/003_TextIndexSelector";
import { AudioController } from "./000_parts/004_AudioController";
import { ExportController } from "./000_parts/005_ExportController";

export const Frame = () => {
    const { corpusDataState, frontendState, audioControllerState, waveSurferState } = useAppState();

    useEffect(() => {
        const keyDownHandler = (ev: KeyboardEvent) => {
            console.log("EVENT:", ev);
            const audioActive = audioControllerState.audioControllerState === "play" || audioControllerState.audioControllerState === "record";
            const unsavedRecord = audioControllerState.unsavedRecord;

            const key = ev.code;
            switch (key) {
                case "ArrowUp":
                case "ArrowLeft":
                    if (frontendState.targetTextIndex > 0 && !audioActive && !unsavedRecord) {
                        frontendState.setTargetTextIndex(frontendState.targetTextIndex - 1);
                    }
                    return;
                case "ArrowDown":
                case "ArrowRight":
                    if (!frontendState.targetCorpusTitle) {
                        return;
                    }
                    if (frontendState.targetTextIndex < corpusDataState.corpusTextData[frontendState.targetCorpusTitle].text.length - 1 && !audioActive && !unsavedRecord) {
                        frontendState.setTargetTextIndex(frontendState.targetTextIndex + 1);
                    }
                    return;
            }

            if (key === "Space") {
                //   let color = Math.floor(Math.random() * 0xFFFFFF).toString(16);
                //   for(let count = color.length; count < 6; count++) {
                //     color = '0' + color;
                //   }
                //   setBackgroundColor('#' + color);
            }
        };
        document.addEventListener("keydown", keyDownHandler, false);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        };
    }, [frontendState.targetTextIndex, audioControllerState.unsavedRecord, audioControllerState.audioControllerState]);
    useEffect(() => {
        const timeDiv = document.getElementById("waveform-time") as HTMLDivElement;
        waveSurferState.setListener({
            audioprocess: () => {
                const timeInfos = waveSurferState.getTimeInfos();
                timeDiv.innerText = `Time:${timeInfos.currentTime.toFixed(2)} / ${timeInfos.totalTime.toFixed(2)}`;
            },
            finish: () => {
                audioControllerState.setAudioControllerState("stop");
            },
            ready: () => {
                const timeInfos = waveSurferState.getTimeInfos();
                timeDiv.innerText = `Time:${timeInfos.currentTime.toFixed(2)} / ${timeInfos.totalTime.toFixed(2)}`;
            },
            regionUpdate: (start: number, end: number) => {
                if (!frontendState.targetCorpusTitle) {
                    return;
                }
                corpusDataState.setRegion(frontendState.targetCorpusTitle, frontendState.targetTextIndex, start, end);
            },
        });
    }, [waveSurferState.setListener, waveSurferState.getTimeInfos, frontendState.targetCorpusTitle, frontendState.targetTextIndex, corpusDataState.setRegion]);

    useEffect(() => {
        if (!frontendState.targetCorpusTitle) {
            return;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        if (!corpus) {
            return;
        }
        const start = corpus.regions[frontendState.targetTextIndex][0];
        const end = corpus.regions[frontendState.targetTextIndex][1];
        const dur = end - start;

        const regionTimeDiv = document.getElementById("waveform-region-time") as HTMLDivElement;
        regionTimeDiv.innerText = `Region:${start.toFixed(2)} - ${end.toFixed(2)} [${dur.toFixed(2)}]`;
    }, [corpusDataState.corpusTextData, frontendState.targetCorpusTitle, frontendState.targetTextIndex]);

    return (
        <div>
            <audio src="" id={AudioOutputElementId}></audio>
            <div className="header">
                <div className="header-application-title-container">
                    <img src="./assets/icons/flect.png" className="header-application-title-logo"></img>
                    <div className="header-application-title-text">Corpus Voice Recorder</div>
                </div>
                <div className="header-device-selector-container">
                    <div className="header-device-selector-text">Mic:</div>
                    <DeviceSelector deviceType={"audioinput"}></DeviceSelector>
                    <div className="header-device-selector-text">Sample Rate:48000Hz</div>
                    <div className="header-device-selector-text">Sample Depth:16bit</div>
                    <div className="header-device-selector-text">Speaker:</div>
                    <DeviceSelector deviceType={"audiooutput"}></DeviceSelector>
                </div>
            </div>
            <div className="body">
                <div className="controller">
                    <div className="corpus-selector-label">Corpus:</div>
                    <CorpusSelector></CorpusSelector>
                    <TextIndexSelector></TextIndexSelector>
                    <AudioController></AudioController>
                    <ExportController></ExportController>
                </div>
                <RecorderCardContainer></RecorderCardContainer>
                <div className="waveform-container">
                    <div className="waveform-header">
                        <div id="waveform-time" className="waveform-header-item"></div>
                        <div id="waveform-region-time" className="waveform-header-item"></div>
                    </div>
                    <div id="waveform"></div>
                    <div id="wave-timeline"></div>
                </div>
            </div>
        </div>
    );
};
