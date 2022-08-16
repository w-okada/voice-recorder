import React, { useMemo, useState } from "react";
import { useAppState } from "../../003_provider/AppStateProvider";
import { generateWavFileName } from "../../const";
import JSZip from "jszip";

export const ExportController = () => {
    const { frontendState, corpusDataState } = useAppState();
    const [exporting, setExporting] = useState<boolean>(false);
    const [objectNum, setObjectNum] = useState<number>(0);
    const [processedNum, setProcessdNum] = useState<number>(0);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const convert48KhzTo24Khz = async (blob: Blob, startSec?: number, endSec?: number) => {
        blob.arrayBuffer;
        const oldView = new DataView(await blob.arrayBuffer());
        const sampleBytes = oldView.getUint32(40, true); // サンプルデータサイズ = 長さ * 2byte(16bit)
        const sampleLength24Khz = Math.floor(sampleBytes / 2 / 2) + 1;
        // サンプルデータサイズ　 / 2bytes(16bit) => サンプル数(48Khz),
        // サンプル数(48Khz) / 2 = サンプル数(24Khz)　※ 小数点切り捨て + 1

        const startIndex = startSec ? Math.floor(startSec * 24000) : 0;
        const endIndex = endSec ? Math.floor(endSec * 24000) : sampleLength24Khz;
        let sampleNum = endIndex - startIndex;
        if (sampleNum > sampleLength24Khz) {
            sampleNum = sampleLength24Khz;
        }

        console.log("cut...", startIndex, endIndex, sampleNum);

        const buffer = new ArrayBuffer(44 + sampleNum * 2);
        const newView = new DataView(buffer);
        // https://www.youfit.co.jp/archives/1418
        writeString(newView, 0, "RIFF"); // RIFFヘッダ
        newView.setUint32(4, 32 + sampleNum * 2, true); // これ以降のファイルサイズ
        writeString(newView, 8, "WAVE"); // WAVEヘッダ
        writeString(newView, 12, "fmt "); // fmtチャンク
        newView.setUint32(16, 16, true); // fmtチャンクのバイト数
        newView.setUint16(20, 1, true); // フォーマットID
        newView.setUint16(22, 1, true); // チャンネル数
        newView.setUint32(24, 24000, true); // サンプリングレート
        newView.setUint32(28, 24000 * 2, true); // データ速度
        newView.setUint16(32, 2, true); // ブロックサイズ
        newView.setUint16(34, 16, true); // サンプルあたりのビット数
        writeString(newView, 36, "data"); // dataチャンク
        newView.setUint32(40, sampleNum * 2, true); // 波形データのバイト数
        const offset = 44;
        console.log("converting...", sampleBytes);
        for (let i = 0; i < sampleNum; i++) {
            try {
                const org = oldView.getInt16(offset + 4 * (i + startIndex), true);
                newView.setInt16(offset + 2 * i, org, true);
            } catch (e) {
                console.log(e, "reading...", offset + 4 * i, 4 * i);
                break;
            }
        }
        const audioBlob = new Blob([newView], { type: "audio/wav" });
        return audioBlob;
    };

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

            const wav24Khz = convert48KhzTo24Khz(blob);
            zip.file(`raw24k/${fileName}`, wav24Khz);
            processedNum += 1;
            setProcessdNum(processedNum);

            const start = corpus.regions[i][0];
            const end = corpus.regions[i][1];
            const wav24KhzTrim = convert48KhzTo24Khz(blob, start, end);
            zip.file(`rawTrim24k/${fileName}`, wav24KhzTrim);
            processedNum += 1;
            setProcessdNum(processedNum);

            // const trimOptions = `-ss ${start} -i in.wav -t ${dur} out.wav`;
            // const trimedBlob = await ffmpegState.exec(trimOptions, "in.wav", "out.wav", blob, "audio/wav");
            // zip.file(`rawTrimed/${fileName}`, trimedBlob);
            // processedNum += 1;
            // setProcessdNum(processedNum);

            // const options = `-i in.wav -ar 24000 out.wav`;
            // const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", trimedBlob, "audio/wav");
            // zip.file(`raw24k/${fileName}`, newBlob);
            // processedNum += 1;
            // setProcessdNum(processedNum);
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

            const wav24Khz = convert48KhzTo24Khz(blob);
            zip.file(`vf24k/${fileName}`, wav24Khz);
            processedNum += 1;
            setProcessdNum(processedNum);

            const start = corpus.regions[i][0];
            const end = corpus.regions[i][1];
            const wav24KhzTrim = convert48KhzTo24Khz(blob, start, end);
            zip.file(`vfTrim24k/${fileName}`, wav24KhzTrim);
            processedNum += 1;
            setProcessdNum(processedNum);

            // const start = corpus.regions[i][0];
            // const dur = corpus.regions[i][1] - corpus.regions[i][0];
            // const trimOptions = `-ss ${start} -i in.wav -t ${dur} out.wav`;
            // const trimedBlob = await ffmpegState.exec(trimOptions, "in.wav", "out.wav", blob, "audio/wav");
            // zip.file(`vfTrimed/${fileName}`, trimedBlob);

            // const options = `-i in.wav -ar 24000 out.wav`;
            // const newBlob = await ffmpegState.exec(options, "in.wav", "out.wav", trimedBlob, "audio/wav");
            // zip.file(`vf24k/${fileName}`, newBlob);
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
        // const className = ffmpegState.isFfmpegLoaded ? "export-controller-button-export" : "export-controller-button-export-disabled";
        // const onClick = ffmpegState.isFfmpegLoaded
        //     ? exportWav
        //     : () => {
        //           console.warn("ffmpeg is not loaded.");
        //       };

        const className = "export-controller-button-export";
        const onClick = exportWav;

        return (
            <>
                <div className={className} onClick={onClick}>
                    Export
                </div>
                {/* {ffmpegState.isFfmpegLoaded ? "" : <div className="export-controller-button-export-memo">Loading...</div>} */}
            </>
        );
        // }, [corpusDataState, ffmpegState.isFfmpegLoaded]);
    }, [corpusDataState]);

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
