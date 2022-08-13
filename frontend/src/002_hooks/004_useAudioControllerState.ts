import { useState } from "react"


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
    unsavedRecord: boolean
}
export type AudioControllerStateAndMethod = AudioControllerState & {
    setAudioControllerState: (val: AudioControllerStateType) => void
    setTmpMicWavBlob: (val: Blob | undefined) => void
    setTmpVfWavBlob: (val: Blob | undefined) => void
    setUnsavedRecord: (val: boolean) => void
}

export const useAudioControllerState = (): AudioControllerStateAndMethod => {
    const [audioControllerState, setAudioControllerState] = useState<AudioControllerStateType>("stop")
    const [tmpMicWavBlob, setTmpMicWavBlob] = useState<Blob>();
    const [tmpVfWavBlob, setTmpVfWavBlob] = useState<Blob>();
    const [unsavedRecord, setUnsavedRecord] = useState<boolean>(false);
    return {
        audioControllerState,
        tmpMicWavBlob,
        tmpVfWavBlob,
        unsavedRecord,
        setAudioControllerState,
        setTmpMicWavBlob,
        setTmpVfWavBlob,
        setUnsavedRecord,
    }
}
