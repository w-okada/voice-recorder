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
    tmpMicWavURL: string
    tmpVfWavURL: string
}
export type AudioControllerStateAndMethod = AudioControllerState & {
    setAudioControllerState: (val: AudioControllerStateType) => void
    setTmpMicWavURL: (val: string) => void
    setTmpVfWavURL: (val: string) => void
}

export const useAudioControllerState = (): AudioControllerStateAndMethod => {
    const [audioControllerState, setAudioControllerState] = useState<AudioControllerStateType>("stop")
    const [tmpMicWavURL, setTmpMicWavURL] = useState<string>("");
    const [tmpVfWavURL, setTmpVfWavURL] = useState<string>("");
    return {
        audioControllerState,
        tmpMicWavURL,
        tmpVfWavURL,
        setAudioControllerState,
        setTmpMicWavURL,
        setTmpVfWavURL
    }
}
