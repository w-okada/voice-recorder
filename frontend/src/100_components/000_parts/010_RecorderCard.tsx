import React from "react";
import { useMemo } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";

export type RecorderCardProps = {
    index: number;
};

export const RecorderCard = (props: RecorderCardProps) => {
    const { corpusDataState, frontendState } = useAppState();
    const { text, text_hira } = useMemo(() => {
        if (!frontendState.targetCorpusTitle) {
            return { text: "target corpus undefined...", text_hira: "target corpus undefined..." };
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        const text = corpus.text[props.index];
        const text_hira = corpus.text_hira[props.index];
        return { text, text_hira };
    }, [frontendState.targetCorpusTitle]);

    return (
        <div className="recorder-card">
            <div className="recorder-card-title">{props.index + 1}番目</div>
            <div className="recorder-card-text">{text}</div>
            <div className="recorder-card-text_hira">{text_hira}</div>
        </div>
    );
};
