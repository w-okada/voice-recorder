import { useEffect, useState } from "react"
import { fetchTextResource } from "../001_clients_and_managers/002_ResourceLoader"
import { useAppSetting } from "../003_provider/AppSettingProvider"

export type CorpusTextData = {
    "title": string,
    "wavPrefix": string,
    "file": string,
    "file_hira": string,
    "text": string[]
    "text_hira": string[]
    "micWavURL": string[]
    "vfWavURL": string[]
}

export type CorpusDataState = {
    corpusTextData: { [title: string]: CorpusTextData }
}
export type CorpusDataStateAndMethod = CorpusDataState & {
    dummy: () => void
}

export const useCorpusData = (): CorpusDataStateAndMethod => {
    const { applicationSetting } = useAppSetting()
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
                const micWavURL = [...Array(splitText.length)].map(_x => { return "" })
                const vfWavURL = [...Array(splitText.length)].map(_x => { return "" })
                const data: CorpusTextData = {
                    title: x.title,
                    wavPrefix: x.wavPrefix,
                    file: x.file,
                    file_hira: x.file_hira,
                    text: splitText,
                    text_hira: splitTextHira,
                    micWavURL: micWavURL,
                    vfWavURL: vfWavURL
                }
                newCorpusTextData[data.title] = data
            }
            setCorpusTextData(newCorpusTextData)
        }
        loadCorpusText()
    }, [textSettings])

    return {
        corpusTextData,
        dummy: () => { }
    }
}
