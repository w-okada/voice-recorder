import { useEffect, useState } from "react"
import { fetchTextResource } from "../001_clients_and_managers/002_ResourceLoader"
import { useAppSetting } from "../003_provider/AppSettingProvider"
import { generateWavNameForLocalStorage } from "../const"

export type CorpusTextData = {
    "title": string,
    "wavPrefix": string,
    "file": string,
    "file_hira": string,
    "text": string[]
    "text_hira": string[]
    "micWavBlob": (Blob | undefined)[]
    "vfWavBlob": (Blob | undefined)[]
}

export type CorpusDataState = {
    corpusTextData: { [title: string]: CorpusTextData }
}
export type CorpusDataStateAndMethod = CorpusDataState & {
    setWavBlob: (corpusTitle: string, index: number, micBlob: Blob | undefined, vfBlob: Blob | undefined) => void
    getWavBlob: (corpusTitle: string, index: number) => {
        micBlob: Blob | undefined;
        vfBlob: Blob | undefined;
    }
}

export const useCorpusData = (): CorpusDataStateAndMethod => {
    const { applicationSetting, indexedDBState } = useAppSetting()
    const textSettings = applicationSetting?.text
    const [corpusTextData, setCorpusTextData] = useState<{ [title: string]: CorpusTextData }>({})


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
                for (let index = 0; index < splitText.length; index++) {
                    const { micString } = generateWavNameForLocalStorage(x.wavPrefix, index)
                    const obj = await indexedDBState.getItem(micString)
                    // const json = localStorage[micString]
                    if (!obj) {
                        micWavBlob.push(undefined)
                        continue
                    }
                    // const parsed = JSON.parse(json);
                    // const blob = await fetch(parsed.blob).then(res => res.blob());
                    micWavBlob.push(obj as Blob)

                }

                const vfWavBlob: (Blob | undefined)[] = []
                for (let index = 0; index < splitText.length; index++) {
                    const { vfString } = generateWavNameForLocalStorage(x.wavPrefix, index)
                    const obj = await indexedDBState.getItem(vfString)
                    // const json = localStorage[vfString]
                    if (!obj) {
                        vfWavBlob.push(undefined)
                        continue
                    }
                    // const parsed = JSON.parse(json);
                    // const blob = await fetch(parsed.blob).then(res => res.blob());
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
                    vfWavBlob: vfWavBlob
                }
                newCorpusTextData[data.title] = data
            }
            console.log("new Corpus:::", newCorpusTextData)
            setCorpusTextData(newCorpusTextData)
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

    return {
        corpusTextData,
        setWavBlob,
        getWavBlob
    }
}
