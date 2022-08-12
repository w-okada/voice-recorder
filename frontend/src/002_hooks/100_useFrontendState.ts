import { useEffect, useState } from "react"

export type FrontendState = {
    targetCorpusTitle: string | undefined,
    targetTextIndex: number,
}

export type FrontendStateAndMethod = FrontendState & {
    setTargetCorpusTitle: (val: string) => void
    setTargetTextIndex: (val: number) => void
}

export const useFrontendState = (): FrontendStateAndMethod => {
    const [targetCorpusTitle, _setTargetCorpusTitle] = useState<string>()
    const [targetTextIndex, _setTargetTextIndex] = useState<number>(0)

    const setTargetCorpusTitle = (val: string) => {
        localStorage.targetCorpusTitle = val
        _setTargetCorpusTitle(val)
        setTargetTextIndex(0)
    }
    useEffect(() => {
        const current = localStorage.targetCorpusTitle || undefined
        if (current) {
            _setTargetCorpusTitle(current)
        }
    }, [])

    const setTargetTextIndex = (val: number) => {
        localStorage.targetTextIndex = val
        _setTargetTextIndex(val)
    }
    useEffect(() => {
        const current = Number(localStorage.targetTextIndex) || 0
        if (current) {
            _setTargetTextIndex(current)
        }
    }, [])

    return {
        targetCorpusTitle,
        targetTextIndex,

        setTargetCorpusTitle,
        setTargetTextIndex
    }
}