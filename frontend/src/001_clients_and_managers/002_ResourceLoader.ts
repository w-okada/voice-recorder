
export const fetchTextResource = async (url): Promise<string> => {
    const res = await fetch(url, {
        method: "GET"
    });
    const text = res.text()
    return text;
}
