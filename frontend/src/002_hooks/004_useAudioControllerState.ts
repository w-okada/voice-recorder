import { useEffect, useState } from "react"
import { fetchTextResource } from "../001_clients_and_managers/002_ResourceLoader"
import { useAppSetting } from "../003_provider/AppSettingProvider"

export const AudioControllerStateType = {
    stop: "stop",
    record: "record",
    play: "play"
} as const
export type AudioControllerStateType = typeof AudioControllerStateType[keyof typeof AudioControllerStateType]

export type AudioControllerState = {
    audioControllerState: AudioControllerStateType
    tmpMicWavBlob: Blob | undefined
    tmpVfWavBlob: Blob | undefined
}
export type AudioControllerStateAndMethod = AudioControllerState & {
    setAudioControllerState: (val: AudioControllerStateType) => void
    setTmpMicWavBlob: (val: Blob | undefined) => void
    setTmpVfWavBlob: (val: Blob | undefined) => void
}

export const useAudioControllerState = (): AudioControllerStateAndMethod => {
    const [audioControllerState, setAudioControllerState] = useState<AudioControllerStateType>("stop")
    const [tmpMicWavBlob, setTmpMicWavBlob] = useState<Blob>();
    const [tmpVfWavBlob, setTmpVfWavBlob] = useState<Blob>();
    return {
        audioControllerState,
        tmpMicWavBlob,
        tmpVfWavBlob,
        setAudioControllerState,
        setTmpMicWavBlob,
        setTmpVfWavBlob
    }
}
