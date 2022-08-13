import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const TextIndexSelector = () => {
    const { corpusDataState, frontendState, audioControllerState } = useAppState();

    const audioActive = useMemo(() => {
        return audioControllerState.audioControllerState === "play" || audioControllerState.audioControllerState === "record";
    }, [audioControllerState.audioControllerState]);
    const unsavedRecord = useMemo(() => {
        return audioControllerState.unsavedRecord;
    }, [audioControllerState.unsavedRecord]);

    const prevButton = useMemo(() => {
        if (!frontendState.targetCorpusTitle) {
            return <></>;
        }
        let className = "";
        let prevIndex = () => {};
        if (frontendState.targetTextIndex === 0 || audioActive || unsavedRecord) {
            className = "text-index-selector-button-disable";
        } else {
            className = "text-index-selector-button";
            prevIndex = () => {
                frontendState.setTargetTextIndex(frontendState.targetTextIndex - 1);
            };
        }
        return (
            <div className={className} onClick={prevIndex}>
                <FontAwesomeIcon icon={["fas", "angle-left"]} size="1x" />
            </div>
        );
    }, [frontendState.targetCorpusTitle, frontendState.targetTextIndex, audioActive, unsavedRecord]);
    const nextButton = useMemo(() => {
        if (!frontendState.targetCorpusTitle) {
            return <></>;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        if (!corpus) {
            return <></>;
        }

        let className = "";
        let nextIndex = () => {};
        const length = corpus.text.length;
        if (frontendState.targetTextIndex === length - 1 || audioActive || unsavedRecord) {
            className = "text-index-selector-button-disable";
        } else {
            className = "text-index-selector-button";
            nextIndex = () => {
                frontendState.setTargetTextIndex(frontendState.targetTextIndex + 1);
            };
        }
        return (
            <div className={className} onClick={nextIndex}>
                <FontAwesomeIcon icon={["fas", "angle-right"]} size="1x" />
            </div>
        );
    }, [corpusDataState.corpusTextData, frontendState.targetCorpusTitle, frontendState.targetTextIndex, audioActive, unsavedRecord]);

    const indexText = useMemo(() => {
        if (!frontendState.targetCorpusTitle) {
            return <></>;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        if (!corpus) {
            return <></>;
        }
        const length = corpus.text.length;
        const text = `${frontendState.targetTextIndex + 1}/${length}`;
        return <div className="text-index-selector-current-index">{text}</div>;
    }, [corpusDataState.corpusTextData, frontendState.targetCorpusTitle, frontendState.targetTextIndex]);
    return (
        <div className="text-index-selector-container">
            {prevButton}
            {indexText}
            {nextButton}
        </div>
    );
};
