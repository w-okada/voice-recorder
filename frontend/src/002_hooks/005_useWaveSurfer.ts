import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline";
import { useAppSetting } from "../003_provider/AppSettingProvider";
export type WaveSurferState = {
    dummy: string
}
export type WaveSurferStateAndMethod = WaveSurferState & {
    loadMusic: (blob: Blob) => void
    emptyMusic: () => void
    play: () => void
    stop: () => void
    setListener: (l: WaveSurferListener) => void
    getTimeInfos: () => {
        totalTime: number;
        currentTime: number;
        remainingTime: number;
    }
}

export type WaveSurferListener = {
    audioprocess: () => void
    finish: () => void
    ready: () => void
}

export const useWaveSurfer = (): WaveSurferStateAndMethod => {
    const { deviceManagerState } = useAppSetting()
    const waveSurferRef = useRef<WaveSurfer>()
    const [waveSurfer, setWaveSurfer] = useState<WaveSurfer>()
    useEffect(() => {
        waveSurferRef.current = WaveSurfer.create({
            container: '#waveform',
            plugins: [
                TimelinePlugin.create({
                    container: "#wave-timeline",
                    primaryLabelInterval: (_pxPerSec: number) => { return 2 },
                    secondaryLabelInterval: (_pxPerSec: number) => { return 1 },
                    primaryFontColor: "#f00",
                    // secondaryFontColor: "#0f0",
                    fontSize: 20
                })
            ]
        })
        setWaveSurfer(waveSurferRef.current)
    }, [])
    const loadMusic = (blob: Blob) => {
        waveSurfer!.loadBlob(blob);
    }
    const emptyMusic = () => {
        waveSurfer!.empty()
    }
    const play = () => {
        waveSurfer!.play()
    }
    const stop = () => {
        waveSurfer!.stop()
    }

    const setListener = (l: WaveSurferListener) => {
        if (!waveSurfer) {
            return
        }
        waveSurfer.on("audioprocess", l.audioprocess)
        waveSurfer.on("finish", l.finish)
        // That event doesn’t trigger as I’m using webaudio. I read in the documentation that:waveform-ready – Fires after the waveform is drawn when using the MediaElement backend. If you’re using the WebAudio backend, you can use ready. (https://lightrun.com/answers/katspaugh-wavesurfer-js-save-wavesurfer-state-and-preload-on-reload)
        // waveSurfer.on('waveform-ready', () => {
        //     console.log("ready!!!!")
        // })
        waveSurfer.on("ready", l.ready)
    }
    const getTimeInfos = () => {
        let totalTime = 0
        let currentTime = 0
        let remainingTime = 0
        if (waveSurfer) {
            totalTime = waveSurfer.getDuration()
            currentTime = waveSurfer.getCurrentTime()
            remainingTime = totalTime - currentTime
        }
        return { totalTime, currentTime, remainingTime }
    }

    useEffect(() => {
        if (!waveSurfer || !deviceManagerState.audioOutputDeviceId) {
            return
        }
        waveSurfer.setSinkId(deviceManagerState.audioOutputDeviceId)
    }, [waveSurfer, deviceManagerState.audioOutputDeviceId])

    return {
        dummy: "dummy",
        loadMusic,
        emptyMusic,
        play,
        stop,
        setListener,
        getTimeInfos

    }
}