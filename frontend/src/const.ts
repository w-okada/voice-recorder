export const AudioOutputElementId = "audio-output-element"

export const generateWavFileName = (prefix: string, index: number) => {
    const indexString = String(index + 1).padStart(3, '0')
    return `${prefix}${indexString}.wav`
}
export const generateWavNameForLocalStorage = (prefix: string, index: number) => {
    const indexString = String(index + 1).padStart(3, '0')
    const vfString = `${prefix}${indexString}_vf`
    const micString = `${prefix}${indexString}_mic`
    return { micString, vfString }
}
export const generateRegionNameForLocalStorage = (prefix: string, index: number) => {
    const indexString = String(index + 1).padStart(3, '0')
    const regionString = `${prefix}${indexString}_region`
    return regionString
}