import React from "react";
import { useMemo } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { RecorderCard } from "./010_RecorderCard";

export const RecorderCardContainer = () => {
    const { corpusDataState, frontendState } = useAppState();

    const cards = useMemo(() => {
        if (!frontendState.targetCorpusTitle || !corpusDataState.corpusTextData[frontendState.targetCorpusTitle]) {
            return <>loading...</>;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        const textSize = corpus.text.length;
        console.log("TEXT_SIZE:::", textSize);
        const cards = [...Array(textSize)].map((_, index) => {
            return <RecorderCard key={index} index={index}></RecorderCard>;
        });
        return cards;
    }, [frontendState.targetCorpusTitle, corpusDataState.corpusTextData]);

    const top = `${-300 * frontendState.targetTextIndex}px`;

    return (
        <div className="recorder-card-container">
            <div className="recorder-card-list" style={{ top: top }}>
                {cards}
            </div>
        </div>
    );
};
