import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { generateWavFileName } from "../../const";
import JSZip from "jszip";

export const ExportController = () => {
    const { frontendState, corpusDataState, ffmpegState } = useAppState();
    const exportWav = async () => {
        if (!frontendState.targetCorpusTitle) {
            return;
        }
        const corpus = corpusDataState.corpusTextData[frontendState.targetCorpusTitle];
        const prefix = corpus.wavPrefix;
        const zip = new JSZip();

        // corpus.micWavBlob.forEach(async (x, index) => {
        //     if (!x) {
        //         return;
        //     }
        //     const fileName = generateWavFileName(prefix, index);
        //     zip.file(`raw/${fileName}`, x);
        //     /// `ffmpeg -i ${fileName}_in -ar 24000 ${fileName}`
        //     const options = `-i in.wav -ar 24000 out.wav`;
        //     const newWav = await ffmpegState.exec(options, "tmp.wav", "out.wav", x, "audio/wav");
        // });

        for (let i = 0; i < corpus.micWavBlob.length; i++) {
            const blob = corpus.micWavBlob[i];
            if (!blob) {
                continue;
            }
            const fileName = generateWavFileName(prefix, i);
            zip.file(`raw/${fileName}`, blob);

            const options = `-i in.wav -ar 24000 out.wav`;
            const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", blob, "audio/wav");
            zip.file(`raw24k/${fileName}`, newBlob);
        }

        for (let i = 0; i < corpus.vfWavBlob.length; i++) {
            const blob = corpus.vfWavBlob[i];
            if (!blob) {
                continue;
            }
            const fileName = generateWavFileName(prefix, i);
            zip.file(`vf/${fileName}`, blob);

            const options = `-i in.wav -ar 24000 out.wav`;
            const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", blob, "audio/wav");
            zip.file(`vf24k/${fileName}`, newBlob);
        }

        // corpus.vfWavBlob.forEach((x, index) => {
        //     if (!x) {
        //         return;
        //     }
        //     const fileName = generateWavFileName(prefix, index);

        //     zip.file(`vf/${fileName}`, x);
        // });

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
