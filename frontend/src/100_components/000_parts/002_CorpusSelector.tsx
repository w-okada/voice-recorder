import React, { Suspense, useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";

export const CorpusSelector = () => {
    const { corpusDataState, frontendState } = useAppState();

    const options = useMemo(() => {
        console.log("Corpus data:", corpusDataState.corpusTextData);
        const options = Object.keys(corpusDataState.corpusTextData).map((title) => {
            return (
                <option className="corpus-selector-option" key={title} value={title}>
                    {title}
                </option>
            );
        });
        if (!frontendState.targetCorpusTitle) {
            options.unshift(<option className="corpus-selector-option" key={"none"} value={"none"}></option>);
        }
        return options;
    }, [corpusDataState.corpusTextData]);

    const selector = useMemo(() => {
        return (
            <select
                defaultValue={frontendState.targetCorpusTitle}
                onChange={(e) => {
                    frontendState.setTargetCorpusTitle(e.target.value);
                }}
                className="corpus-selector-select"
            >
                {options}
            </select>
        );
    }, [frontendState.targetCorpusTitle, options]);

    const Wrapper = () => {
        if (Object.keys(corpusDataState.corpusTextData).length === 0) {
            throw new Promise((resolve) => setTimeout(resolve, 1000 * 2));
        }
        return selector;
    };
    return (
        <Suspense fallback={<>loading...</>}>
            <Wrapper></Wrapper>
        </Suspense>
    );
};
