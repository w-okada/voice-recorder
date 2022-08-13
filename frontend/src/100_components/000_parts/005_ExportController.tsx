import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { AudioOutputElementId, generateWavFileName, generateWavNameForLocalStorage } from "../../const";
import JSZip from "jszip";

export const ExportController = () => {
    const { audioControllerState, mediaRecorderState, frontendState, corpusDataState } = useAppState();
    const exportWav = async () => {
        if (!frontendState.targetCorpusTitle) {
            return;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        const prefix = corpus.wavPrefix;
        const zip = new JSZip();

        corpus.micWavBlob.forEach((x, index) => {
            if (!x) {
                return;
            }
            const fileName = generateWavFileName(prefix, index);
            // const wav =

            zip.file(`raw/${fileName}`, x);
        });
        corpus.vfWavBlob.forEach((x, index) => {
            if (!x) {
                return;
            }
            const fileName = generateWavFileName(prefix, index);
            // const wav =

            zip.file(`vf/${fileName}`, x);
        });

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${corpus.title}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportButton = useMemo(() => {
        return (
            <div className="export-controller-button-export" onClick={exportWav}>
                Export
            </div>
        );
    }, [corpusDataState]);
    return <div className="export-controller-button-container">{exportButton}</div>;
};
