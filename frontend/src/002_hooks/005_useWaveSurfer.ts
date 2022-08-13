import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline";
import { ListenerDescriptor } from "wavesurfer.js/types/util";
import { useAppSetting } from "../003_provider/AppSettingProvider";
export type WaveSurferState = {
    dummy: string
}
export type WaveSurferStateAndMethod = WaveSurferState & {
    loadMusic: (blob: Blob) => void
    emptyMusic: () => void
    play: () => void
    playRegion: () => void
    stop: () => void
    setListener: (l: WaveSurferListener) => void
    getTimeInfos: () => {
        totalTime: number;
        currentTime: number;
        remainingTime: number;
    }
    setRegion: (start: number, end: number) => void
}

export type WaveSurferListener = {
    audioprocess: () => void
    finish: () => void
    ready: () => void
    regionUpdate: (start: number, end: number) => void
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
                }),
                RegionsPlugin.create({
                    regionsMinLength: 1,
                    regions: [
                        {
                            start: 1,
                            end: 3,
                            loop: false,
                            color: 'hsla(400, 100%, 30%, 0.5)'
                        },
                    ]
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
    const playRegion = () => {
        Object.values(waveSurfer!.regions.list)[0].play()
    }

    const stop = () => {
        waveSurfer!.stop()
    }

    const listenersRef = useRef<ListenerDescriptor[]>([])
    const setListener = (l: WaveSurferListener) => {
        if (!waveSurfer) {
            return
        }

        listenersRef.current.forEach(x => {
            waveSurfer.un(x.name, x.callback)
        })
        const l1 = waveSurfer.on("region-update-end", () => {
            const region = Object.values(waveSurfer.regions.list)[0]
            if (!region) {
                console.warn("no region")
                return
            }
            l.regionUpdate(region.start, region.end)

        })
        const l2 = waveSurfer.on("audioprocess", l.audioprocess)
        const l3 = waveSurfer.on("finish", l.finish)
        const l3_2 = waveSurfer.on("region-out", l.finish)
        // That event doesn’t trigger as I’m using webaudio. I read in the documentation that:waveform-ready – Fires after the waveform is drawn when using the MediaElement backend. If you’re using the WebAudio backend, you can use ready. (https://lightrun.com/answers/katspaugh-wavesurfer-js-save-wavesurfer-state-and-preload-on-reload)
        // waveSurfer.on('waveform-ready', () => {
        //     console.log("ready!!!!")
        // })
        const l4 = waveSurfer.on("ready", l.ready)
        listenersRef.current = [l1, l2, l3, l3_2, l4]

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
    const setRegion = (start: number, end: number) => {
        if (!waveSurfer) {
            return
        }
        const region = Object.values(waveSurfer.regions.list)[0]
        if (!region) {
            console.warn("no region")
            return
        }
        region.update({ start: start, end: end })
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
        playRegion,
        stop,
        setListener,
        getTimeInfos,
        setRegion
    }
}