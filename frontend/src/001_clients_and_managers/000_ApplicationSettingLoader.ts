export type ApplicationSetting =
    {
        "app_title": string,
        "text": CorpusTextSetting[]
    }

export type CorpusTextSetting = {
    "title": string,
    "wavPrefix": string,
    "file": string,
    "file_hira": string

}

export const fetchApplicationSetting = async (): Promise<ApplicationSetting> => {
    const url = `./assets/setting.json`
    const res = await fetch(url, {
        method: "GET"
    });
    const setting = await res.json() as ApplicationSetting
    return setting;
}
