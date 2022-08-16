import { useEffect, useRef, useState } from "react";
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";



export type FfmpegState = {
    progress: number
    isFfmpegLoaded: boolean
}
export type FfmpegStateAndMethod = FfmpegState & {
    exec: (optionString: string, inputFileName: string, outputFileName: string, inputFile: Blob, outputType: string) => Promise<Blob>
}

export const useFfmepg = (): FfmpegStateAndMethod => {
    const [progress, setProgress] = useState<number>(0)
    const [isFfmpegLoaded, setIsFfmpegLoaded] = useState<boolean>(false)
    useEffect(() => {
        const ffmpeg = createFFmpeg({
            log: true,
            corePath: "./ffmpeg/ffmpeg-core.js",
        });
        const loadFfmpeg = async () => {
            await ffmpeg!.load();
            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setProgress(ratio);
            });
            console.log("ffmpeg is loaded!")
            setIsFfmpegLoaded(true)
        };
        loadFfmpeg();

    }, [])


    const ffmpegRef = useRef<FFmpeg>()
    const ffmpegCount = useRef<number>(0)


    // emscriptenのファイルシステムにファイルを乗っける時に、ファイル名が必要なので、
    // オプション内に記載されているファイル名を第2、第3引数で渡す。
    // （簡単化の為、オプションのパースはしない。）
    // [!! 注意 !!] optionStringはffmpegを入れない。純粋にオプション文字列。
    // outputTypeは"audio/wav" など。
    const exec = async (optionString: string, inputFileName: string, outputFileName: string, inputFile: Blob, outputType: string) => {
        if (!ffmpegRef.current || ffmpegCount.current > 30) {
            console.log("FFMPEG_RENEW!!", ffmpegCount.current, ffmpegRef.current)
            ffmpegCount.current = 0
            if (ffmpegRef.current) {
                try {
                    ffmpegRef.current.exit()
                    ffmpegRef.current = undefined
                } catch (e) {
                    console.warn("ffmpeg exit", e)
                }
                ffmpegRef.current = undefined
            }
            // upload
            const ffmpeg = createFFmpeg({
                log: true,
                corePath: "./ffmpeg/ffmpeg-core.js",
            });
            await ffmpeg!.load();
            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setProgress(ratio);
            });
            console.log("ffmpeg is loaded!")
            ffmpegRef.current = ffmpeg
        }
        ffmpegCount.current++;

        ffmpegRef.current.FS("writeFile", inputFileName, await fetchFile(inputFile));
        const cliArgs = optionString.split(" ");
        await ffmpegRef.current.run(...cliArgs);
        const data = ffmpegRef.current.FS("readFile", outputFileName);
        const blob = new Blob([data.buffer], { type: outputType })
        ffmpegRef.current.FS("unlink", inputFileName)
        ffmpegRef.current.FS("unlink", outputFileName)

        return blob
    }

    return {
        progress,
        isFfmpegLoaded,
        exec,
    }
}