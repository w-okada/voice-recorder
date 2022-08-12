import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { AudioOutputElementId, generateWavNameForLocalStorage } from "../../const";

export const ExportController = () => {
    const { audioControllerState, mediaRecorderState, frontendState, corpusDataState } = useAppState();
    const exportWav = () => {};

    const exportButton = useMemo(() => {
        return (
            <div className="export-controller-button-export" onClick={exportWav}>
                Export
            </div>
        );
    }, []);
    return <div className="export-controller-button-container">{exportButton}</div>;
};
