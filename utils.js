import get from "./fetch";

export function getLatestMovies() {
    const url = "now_playing?language=en-US&page=1";
    return new Promise(async(resolve, reject) => {
        try {
            const response = await get(url);
            console.log(response);
            resolve(response);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}