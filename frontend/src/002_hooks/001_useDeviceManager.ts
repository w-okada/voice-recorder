import { useEffect, useMemo, useState } from "react"
import { DeviceInfo, DeviceManager } from "../001_clients_and_managers/001_DeviceManager"


export type UseDeviceManagerProps = {
    outputAudioElementId: string
}

type DeviceManagerState = {
    lastUpdateTime: number
    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

    audioInputDeviceId: string | null
    audioOutputDeviceId: string | null
}
export type DeviceManagerStateAndMethod = DeviceManagerState & {
    reloadDevices: () => Promise<void>
    setAudioInputDeviceId: (val: string | null) => void
    setAudioOutputDeviceId: (val: string | null) => void

}
export const useDeviceManager = (props: UseDeviceManagerProps): DeviceManagerStateAndMethod => {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [audioInputDeviceId, _setAudioInputDeviceId] = useState<string | null>(null)
    const [audioOutputDeviceId, _setAudioOutputDeviceId] = useState<string | null>(null)

    const deviceManager = useMemo(() => {
        const manager = new DeviceManager()
        manager.setUpdateListener({
            update: () => {
                setLastUpdateTime(new Date().getTime())
            }
        })
        manager.reloadDevices()
        return manager
    }, [])

    // () Enumerate
    const reloadDevices = useMemo(() => {
        return async () => {
            deviceManager.reloadDevices()
        }
    }, [])

    const setAudioInputDeviceId = async (val: string | null) => {
        localStorage.audioInputDevice = val;
        _setAudioInputDeviceId(val)
    }
    useEffect(() => {
        const audioInputDeviceId = localStorage.audioInputDevice || null
        _setAudioInputDeviceId(audioInputDeviceId)
    }, [])


    const setAudioOutputDeviceId = async (val: string | null) => {
        localStorage.audioOutputDevice = val;
        const outputAudioElement = document.getElementById(props.outputAudioElementId) as HTMLAudioElement;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        outputAudioElement.setSinkId(val)
        _setAudioOutputDeviceId(val)
    }
    useEffect(() => {
        const audioOutputDeviceId = localStorage.audioOutputDevice || null
        const outputAudioElement = document.getElementById(props.outputAudioElementId) as HTMLAudioElement;
        console.log("audio output", audioOutputDeviceId)

        if (audioOutputDeviceId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            outputAudioElement.setSinkId(audioOutputDeviceId)
        }
        _setAudioOutputDeviceId(audioOutputDeviceId)
    }, [])

    return {
        lastUpdateTime,
        audioInputDevices: deviceManager.realAudioInputDevices,
        videoInputDevices: deviceManager.realVideoInputDevices,
        audioOutputDevices: deviceManager.realAudioOutputDevices,

        audioInputDeviceId,
        audioOutputDeviceId,
        reloadDevices,
        setAudioInputDeviceId,
        setAudioOutputDeviceId,
    }
}