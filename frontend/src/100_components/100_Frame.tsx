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
    const { mediaRecorderState, frontendState } = useAppState();

    useEffect(() => {
        const keyDownHandler = (ev: KeyboardEvent) => {
            console.log("EVENT:", ev);
            const key = ev.code;
            switch (key) {
                case "ArrowUp":
                case "ArrowLeft":
                    frontendState.setTargetTextIndex(frontendState.targetTextIndex - 1);
                    return;
                case "ArrowDown":
                case "ArrowRight":
                    frontendState.setTargetTextIndex(frontendState.targetTextIndex + 1);
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
    }, [frontendState.targetTextIndex]);

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
                    <div className="header-device-selector-text">Sample Rate:44100Hz</div>
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
                {/* <div
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
                </div> */}
                <RecorderCardContainer></RecorderCardContainer>
            </div>
        </div>
    );
};
