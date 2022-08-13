import React, { useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { generateWavFileName } from "../../const";
import JSZip from "jszip";

export const ExportController = () => {
    const { frontendState, corpusDataState, ffmpegState } = useAppState();
    const [exporting, setExporting] = useState<boolean>(false);
    const [objectNum, setObjectNum] = useState<number>(0);
    const [processedNum, setProcessdNum] = useState<number>(0);

    const exportWav = async () => {
        if (!frontendState.targetCorpusTitle) {
            return;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        const prefix = corpus.wavPrefix;
        const zip = new JSZip();
        setObjectNum(corpus.micWavBlob.length * 6);
        let processedNum = 0;
        setProcessdNum(0);
        setExporting(true);

        for (let i = 0; i < corpus.micWavBlob.length; i++) {
            const blob = corpus.micWavBlob[i];
            if (!blob) {
                continue;
            }
            const fileName = generateWavFileName(prefix, i);
            zip.file(`raw/${fileName}`, blob);
            processedNum += 1;
            setProcessdNum(processedNum);

            const start = corpus.regions[i][0];
            const dur = corpus.regions[i][1] - corpus.regions[i][0];
            const trimOptions = `-ss ${start} -i in.wav -t ${dur} out.wav`;
            const trimedBlob = await ffmpegState.exec(trimOptions, "in.wav", "out.wav", blob, "audio/wav");
            zip.file(`rawTrimed/${fileName}`, trimedBlob);
            processedNum += 1;
            setProcessdNum(processedNum);

            const options = `-i in.wav -ar 24000 out.wav`;
            const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", trimedBlob, "audio/wav");
            zip.file(`raw24k/${fileName}`, newBlob);
            processedNum += 1;
            setProcessdNum(processedNum);
        }

        for (let i = 0; i < corpus.vfWavBlob.length; i++) {
            const blob = corpus.vfWavBlob[i];
            if (!blob) {
                continue;
            }
            const fileName = generateWavFileName(prefix, i);
            zip.file(`vf/${fileName}`, blob);
            processedNum += 1;
            setProcessdNum(processedNum);

            const start = corpus.regions[i][0];
            const dur = corpus.regions[i][1] - corpus.regions[i][0];
            const trimOptions = `-ss ${start} -i in.wav -t ${dur} out.wav`;
            const trimedBlob = await ffmpegState.exec(trimOptions, "in.wav", "out.wav", blob, "audio/wav");
            zip.file(`vfTrimed/${fileName}`, trimedBlob);
            processedNum += 1;
            setProcessdNum(processedNum);

            const options = `-i in.wav -ar 24000 out.wav`;
            const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", trimedBlob, "audio/wav");
            zip.file(`vf24k/${fileName}`, newBlob);
            processedNum += 1;
            setProcessdNum(processedNum);
        }

        setExporting(false);
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
        const className = ffmpegState.isFfmpegLoaded ? "export-controller-button-export" : "export-controller-button-export-disabled";
        const onClick = ffmpegState.isFfmpegLoaded
            ? exportWav
            : () => {
                  console.warn("ffmpeg is not loaded.");
              };
        return (
            <>
                <div className={className} onClick={onClick}>
                    Export
                </div>
                {ffmpegState.isFfmpegLoaded ? "" : <div className="export-controller-button-export-memo">Loading...</div>}
            </>
        );
    }, [corpusDataState, ffmpegState.isFfmpegLoaded]);

    const progress = useMemo(() => {
        if (!exporting) {
            return <></>;
        }

        return `${processedNum}/${objectNum}`;
    }, [exporting, objectNum, processedNum]);

    return (
        <div className="export-controller-button-container">
            {exportButton}
            {progress}
        </div>
    );
};
