export default function get(url) {
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNDE0NjcwYTU2ZjFiNTJiNDc2ZWI3YjZlZTQ4Y2QwZCIsInN1YiI6IjYxNDIzNzVkZWM0NTUyMDAyYjQ1ZjJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gdgIvK2KEQOoa7NTW92VRser2FMKSyLbvj2-dMgqL5s'
            }
        };
        return new Promise((resolve, reject) => {
            try {
                fetch(`https://api.themoviedb.org/3/movie/${url}`, options)
                    .then(res => res.json())
                    .then(resolve)
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    })
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
}