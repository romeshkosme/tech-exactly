(() => {
    // TO STORE IMAGE CONFIGURATION, BASE URL
    const CONFIGURATIONS = {};
    // GENERIC FETCH FUNCTION
    function get(url) {
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNDE0NjcwYTU2ZjFiNTJiNDc2ZWI3YjZlZTQ4Y2QwZCIsInN1YiI6IjYxNDIzNzVkZWM0NTUyMDAyYjQ1ZjJhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gdgIvK2KEQOoa7NTW92VRser2FMKSyLbvj2-dMgqL5s'
            }
        };
        return new Promise((resolve, reject) => {
            try {
                fetch(`https://api.themoviedb.org/3/${url}`, options)
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

    // GET CONFIGURATION
    function getConfiguration() {
        const url = "configuration";
        new Promise(async (resolve, reject) => {
            const config = await get(url);
            const {images} = config;
            if (images && images.secure_base_url) {
                CONFIGURATIONS["images_base_url"] = images.secure_base_url;
            } else if (images && images.base_url) {
                CONFIGURATIONS["images_base_url"] = images.base_url;
            }
        })
    }

    // GET NOW PLAYING
    function getLatestMovies() {
        const url = "movie/now_playing?language=en-US&page=1";
        return new Promise(async(resolve, reject) => {
            try {
                shimmerList();
                const response = await get(url);
                if (response && response.results && response.results.length > 0) {
                    renderMovieList(response.results);
                }
                resolve(response);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }

    // GET MOVIE DETAILS FOR MODAL
    function getMovie(id) {
        return new Promise(async(resolve, reject) => {
            try {
                const url = `movie/${id}`
                const movie = await get(url);
                resolve(movie);
            } catch (error) {
                console.log(error)
                reject(error);
            }
        })
    }

    // RENDER MOVIE LIST IN THE DOM
    function renderMovieList(list) {
        const TITLE = "<h2>Now Playing</h2>";
        const SECTION = $("#now-playing");
        const ELEMENT = document.createElement("div");
        ELEMENT.classList = "row";
        let index = 0;
        for (const movie of list) {
            ELEMENT.appendChild(movieCard({...movie, index}));
            index++;
        }
        SECTION.html("");
        SECTION.append(TITLE);
        SECTION.append(ELEMENT);

        addClickListener(list);
    }

    // CREATE MOVIE CARD FOR LIST
    function movieCard({poster_path, id}) {
        const ELEMENT = document.createElement("div");
        ELEMENT.classList = "col-sm-4 p-2";
        const IMAGE_ELEMENT = document.createElement("img");
        IMAGE_ELEMENT.src = `${CONFIGURATIONS["images_base_url"]}original${poster_path}`;
        IMAGE_ELEMENT.dataset["id"] = id;
        IMAGE_ELEMENT.classList = "movie-poster w-100 cursor-pointer"
        ELEMENT.append(IMAGE_ELEMENT);
        return ELEMENT;
    }

    // ADD EVENT LISTENER WHEN USER CLICK ON MOVIE AND MODAL SHOULD OPEN
    function addClickListener() {
        $(".movie-poster").click(function(e) {
            e.stopPropagation();
            if (this.dataset.id) {
                const myModal = new bootstrap.Modal('#movie-details-modal', {
                    keyboard: false
                })
                myModal.show();
                shimmerCard();
                handleModal(this.dataset.id);
            }
        });
    }

    // GET MOVIE VIDEO FROM API FOR TRAILER
    function getMovieVideo(id) {
        return new Promise(async(resolve, reject) => {
            try {
                const url = `movie/${id}/videos`;
                const videos = await get(url);
                const {results} = videos;
                if (results && results.length > 0) {
                    for (const video of results) {
                        if (video.type === "Trailer") {
                            resolve(video.key);
                            return;
                        }
                    }
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }
    
    // RENDER MOVIE DATA IN THE MODAL
    async function handleModal(id) {
        const movie = await getMovie(id);
        const video = await getMovieVideo(id);
        
        const IMAGE_SECTION = $("#modal-movie-image");
        const DETAILS_SECTIONS = $("#modal-movie-detail");

        IMAGE_SECTION.html("");
        DETAILS_SECTIONS.html("");

        const IMAGE = document.createElement("img");
        IMAGE.src = `${CONFIGURATIONS["images_base_url"]}original${movie.poster_path}`;
        IMAGE.classList = "w-100"
        IMAGE_SECTION.append(IMAGE);

        const TITLE = document.createElement("h3");
        TITLE.innerText = movie.original_title;
        const RELEASE_DATE = document.createElement("p");
        RELEASE_DATE.innerText = `Release Date: ${movie.release_date}`

        const TRAILER_WRAPPER = document.createElement("div");
        TRAILER_WRAPPER.innerHTML = `
            <span class="material-symbols-outlined">
                play_arrow
            </span>
            <a href="https://www.youtube.com/watch?v=${video}" target="_blank">Trailer</a>
        `;
        TRAILER_WRAPPER.classList = "d-flex align-items-center mb-2";

        const SUMMARY = document.createElement("p");
        SUMMARY.innerText = movie.overview;

        const RATING = document.createElement("p");
        RATING.innerHTML = `${movie.vote_average}/10`;

        const TIMINGS = ["8:30 AM", "10:00 AM", "12:30 PM", "3:00 PM", "4:10 PM", "5:30 PM", "8:00 PM", "10:30 PM"];
        const TIMINGS_LIST = document.createElement("div");
        TIMINGS_LIST.classList = "row";
        for (const time of TIMINGS) {
            const WRAPPER = document.createElement("div");
            WRAPPER.classList = "col-3 p-0 my-1";
            const button = document.createElement("button");
            button.innerText = time;
            button.classList = "btn btn-outline-primary";
            button.style.width = "95px";
            WRAPPER.append(button);
            TIMINGS_LIST.appendChild(WRAPPER);
        }

        DETAILS_SECTIONS.append(TITLE);
        DETAILS_SECTIONS.append(TRAILER_WRAPPER);
        DETAILS_SECTIONS.append(RELEASE_DATE);
        DETAILS_SECTIONS.append(SUMMARY);
        DETAILS_SECTIONS.append(RATING);
        DETAILS_SECTIONS.append(TIMINGS_LIST);
    }

    // WHEN MODAL CLOSES REMOVE ALL ELEMENTS FROM THE MODAL SO THAT NEXT TIME NEW CONTENT COULD BE PUSHED
    document.getElementById("movie-details-modal").addEventListener('hidden.bs.modal', event => {
        $("#modal-movie-image").html("");
        $("#modal-movie-detail").html("");
    })

    // ADD SHIMMER EFFECT IN THE DOM FOR MOVIE LIST
    function shimmerList() {
        const ROW = document.createElement("div");
        ROW.classList = "row";
        for (let i = 0; i < 6; i++) {
            ROW.innerHTML += `
                <div class="col-4 p-2">
                    <div class="image-shimmer shimmer w-100"></div>
                </div>
            `
        }
        $("#now-playing").append(ROW);
    }

    // ADD SHIMMER EFFECT IN THE MODAL
    function shimmerCard() {
        $("#modal-movie-image").html(`<div class="image-shimmer shimmer w-100 modal-shimmer"></div>`);
        $("#modal-movie-detail").html(`
        <h5 class="card-title placeholder-glow">
            <span class="placeholder col-6"></span>
        </h5>
        <p class="card-text placeholder-glow">
            <span class="placeholder col-7"></span>
            <span class="placeholder col-4"></span>
            <span class="placeholder col-4"></span>
            <span class="placeholder col-6"></span>
            <span class="placeholder col-8"></span>
        </p>
        `)
    }

    // EVENT LISTENER FOR SEARCH FUNCTIONALITY
    $("form").submit((e) => {
        e.preventDefault();
        const query = $("#search").val();
        console.log(query);
        if (query) searchMovie(query);
    })

    // GET SEARCH DATA FROM API
    function searchMovie(query) {
        return new Promise(async(resolve, reject) => {
            try {
                const url = `search/movie?query=${query}&include_adult=false&language=en-US&page=1s`
                const movies = await get(url);
                if (movies && movies.results && movies.results.length > 0) {
                    renderMovieList(movies.results)
                    resolve(movies.results);
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }

    getConfiguration();
    getLatestMovies();
})()