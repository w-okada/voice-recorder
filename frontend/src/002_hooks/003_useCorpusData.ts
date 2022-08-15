import { useEffect, useState } from "react"
import { fetchTextResource } from "../001_clients_and_managers/002_ResourceLoader"
import { useAppSetting } from "../003_provider/AppSettingProvider"
import { generateRegionNameForLocalStorage, generateWavNameForLocalStorage } from "../const"

export type CorpusTextData = {
    "title": string,
    "wavPrefix": string,
    "file": string,
    "file_hira": string,
    "text": string[]
    "text_hira": string[]
    "micWavBlob": (Blob | undefined)[]
    "vfWavBlob": (Blob | undefined)[]
    "regions": [number, number][]
}

export type CorpusDataState = {
    corpusTextData: { [title: string]: CorpusTextData }
    corpusLoaded: boolean
}
export type CorpusDataStateAndMethod = CorpusDataState & {
    setWavBlob: (corpusTitle: string, index: number, micBlob: Blob | undefined, vfBlob: Blob | undefined) => void
    getWavBlob: (corpusTitle: string, index: number) => {
        micBlob: Blob | undefined;
        vfBlob: Blob | undefined;
    }
    setRegion: (corpusTitle: string, index: number, start: number, end: number) => Promise<void>
    getRegion: (corpusTitle: string, index: number) => [number, number]
}

export const useCorpusData = (): CorpusDataStateAndMethod => {
    const { applicationSetting, indexedDBState } = useAppSetting()
    const textSettings = applicationSetting?.text
    const [corpusTextData, setCorpusTextData] = useState<{ [title: string]: CorpusTextData }>({})
    const [corpusLoaded, setCorpusLoaded] = useState<boolean>(false)


    useEffect(() => {
        if (!textSettings) {
            return
        }
        const loadCorpusText = async () => {
            const newCorpusTextData: { [title: string]: CorpusTextData } = {}
            for (const x of textSettings) {
                const text = await fetchTextResource(x.file)
                const textHira = await fetchTextResource(x.file_hira)
                const splitText = text.split("\n").filter(x => { return x.length > 0 })
                const splitTextHira = textHira.split("\n").filter(x => { return x.length > 0 })

                const micWavBlob: (Blob | undefined)[] = []
                const regions: [number, number][] = []
                for (let index = 0; index < splitText.length; index++) {
                    const { micString } = generateWavNameForLocalStorage(x.wavPrefix, index)
                    const obj = await indexedDBState.getItem(micString)
                    if (!obj) {
                        micWavBlob.push(undefined)
                    } else {
                        micWavBlob.push(obj as Blob)
                    }

                    const regionString = generateRegionNameForLocalStorage(x.wavPrefix, index)
                    const region = await indexedDBState.getItem(regionString)
                    if (!region) {
                        regions.push([0, 1])
                    } else {
                        regions.push(region as [number, number])
                    }
                }

                const vfWavBlob: (Blob | undefined)[] = []
                for (let index = 0; index < splitText.length; index++) {
                    const { vfString } = generateWavNameForLocalStorage(x.wavPrefix, index)
                    const obj = await indexedDBState.getItem(vfString)
                    if (!obj) {
                        vfWavBlob.push(undefined)
                        continue
                    }
                    vfWavBlob.push(obj as Blob)
                }

                // console.log("vfWavURL:", vfWavBlob)
                const data: CorpusTextData = {
                    title: x.title,
                    wavPrefix: x.wavPrefix,
                    file: x.file,
                    file_hira: x.file_hira,
                    text: splitText,
                    text_hira: splitTextHira,
                    micWavBlob: micWavBlob,
                    vfWavBlob: vfWavBlob,
                    regions: regions
                }
                newCorpusTextData[data.title] = data
            }
            console.log("new Corpus:::", newCorpusTextData)
            setCorpusTextData(newCorpusTextData)
            setCorpusLoaded(true)
        }
        loadCorpusText()
    }, [textSettings])

    const setWavBlob = async (corpusTitle: string, index: number, micBlob: Blob | undefined, vfBlob: Blob | undefined) => {
        const prefix = corpusTextData[corpusTitle].wavPrefix
        const { micString, vfString } = generateWavNameForLocalStorage(prefix, index)
        // const micB64 = await blobToBase64(micBlob)
        // console.log("MIC", micBlob, micB64)
        // localStorage[micString] = JSON.stringify({ blob: micB64 })
        await indexedDBState.setItem(micString, micBlob)

        // const vfB64 = await blobToBase64(vfBlob)
        // localStorage[vfString] = JSON.stringify({ blob: vfB64 })
        await indexedDBState.setItem(vfString, vfBlob)
        corpusTextData[corpusTitle].micWavBlob[index] = micBlob
        corpusTextData[corpusTitle].vfWavBlob[index] = vfBlob
        setCorpusTextData({ ...corpusTextData })
    }
    const getWavBlob = (corpusTitle: string, index: number) => {
        const micBlob = corpusTextData[corpusTitle]?.micWavBlob[index] || undefined
        const vfBlob = corpusTextData[corpusTitle]?.vfWavBlob[index] || undefined
        return { micBlob, vfBlob }
    }

    const setRegion = async (corpusTitle: string, index: number, start: number, end: number) => {

        if (!corpusTextData[corpusTitle]) {
            return
        }
        const prefix = corpusTextData[corpusTitle].wavPrefix
        const regionString = generateRegionNameForLocalStorage(prefix, index)
        await indexedDBState.setItem(regionString, [start, end])
        corpusTextData[corpusTitle].regions[index] = [start, end]
        setCorpusTextData({ ...corpusTextData })
    }
    const getRegion = (corpusTitle: string, index: number) => {
        if (!corpusTextData[corpusTitle]) {
            return [0, 1] as [number, number]
        }
        return corpusTextData[corpusTitle].regions[index]
    }

    return {
        corpusTextData,
        corpusLoaded,
        setWavBlob,
        getWavBlob,
        setRegion,
        getRegion
    }
}
