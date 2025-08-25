/* ---------------- CONFIG ---------------- */
let tracks = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;
let progressInterval;


//api fetch last fm
const apiKey="919dbfaa6b84bfe9b7fb4a43a75f13f9"
const lastfm_url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=india&api_key=${apiKey}&format=json`;
async function getTopArtists() {
      try {
        const response = await fetch(lastfm_url);
        const data = await response.json();
        console.log(data);
        const artistsDiv = document.getElementsByClassName("artists-section");
        artistsDiv.innerHTML = "";

        data.topartists.artist.slice(0, 10).forEach(artist => {
          const img = artist.image.find(img => img.size === "large")["#text"];
          const name = artist.name;

          const artistCard = document.createElement("div");
          artistCard.innerHTML = `
            <img src="${img}" alt="${name}" style="width:100px;height:100px;border-radius:50%">
            <p>${name}</p>
          `;
          artistsDiv.appendChild(artistCard);
        });
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    }
    getTopArtists();

/* ---------------- FETCH SONGS (iTunes API) ---------------- */
async function fetchSongs(query = "The Weeknd") {
    let url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10&country=US`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
}
const API_KEY = "85a0c93ad409da1e12b61af641095ebf"; // replace with your key
const LIMIT = 5; // number of top artists

const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=${LIMIT}`;
fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("artist-container");
    if (!container) {
    console.error("artist-container not found!");
    return;
  }

  function getArtistImage(images) {
  // images is an array of objects: [{size: "small", "#text": "..."}, ...]
  // Iterate from largest to smallest
  for (let i = images.length - 1; i >= 0; i--) {
    if (images[i]["#text"]) return images[i]["#text"];
  }
  return "https://via.placeholder.com/150"; // fallback image
}

    container.innerHTML = ""; // Clear any previous content

    const topArtists = data.artists.artist;

    topArtists.forEach(artist => {
      const card = document.createElement("div");
      card.classList.add("artist-card");

      card.innerHTML = `
        <img src="${artist.image[2]["#text"]}" alt="${artist.name}" class="artist-image">
        <span class="artist-name">${artist.name}</span>
      `;
      card.innerHTML = `
  <img src="${getArtistImage(artist.image)}" alt="${artist.name}" class="artist-image">
  <span class="artist-name">${artist.name}</span>
`;

      // Click event to open Last.fm page or fetch songs
      card.addEventListener("click", () => {
        loadSongs(artist.name) // opens Last.fm page in new tab
        // Or you can trigger your song fetching function here
      });

      container.appendChild(card);
    });
})
.catch(err => console.error("Error fetching top artists:", err));



const cards = document.querySelectorAll(".artist-card");
 cards.forEach(card => {
    card.addEventListener("click", () => {
      const artistName = card.querySelector(".artist-name").textContent;
      
    //   console.log("Clicked artist:",{"artistName"});
      // You can use artistName here (show in player, search songs, etc.)
    });
  });
// fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
//   .then(res => res.json())
//   .then(data => console.log(data.feed.results));

// const url = "https://rss.applemarketingtools.com/api/v2/us/music/most-played-artists/10/artists.json";
// const proxy = "https://cors-anywhere.herokuapp.com/"; // Free CORS proxy

// async function fetchData() {
//     try {
//         const res = await fetch(proxy + url);
//         const data = await res.json();
//         console.log(data);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// } 

// fetchData();

/* ---------------- LOAD SONGS ---------------- */
async function loadSongs(query) {
    try {
        tracks = await fetchSongs(query);
        const songsList = document.querySelector('.songs-list');
        songsList.innerHTML = '';

        tracks.forEach((track, index) => {
            const minutes = Math.floor(track.trackTimeMillis / 60000);
            const seconds = Math.floor((track.trackTimeMillis % 60000) / 1000);

            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                    <img src="${track.artworkUrl100.replace("100x100", "200x200")}" alt="cover" class="song-cover">
                    <div class="song-details">
                        <h3 class="song-title">${track.trackName}</h3>
                        <p class="song-artist">${track.artistName}</p>
                    </div>
                </div>
                <div class="song-duration">${minutes}:${seconds < 10 ? '0' : ''}${seconds}</div>
            `;
            songItem.addEventListener('click', () => playTrack(index));
            songsList.appendChild(songItem);
        });

        // Load first track into player
        updatePlayerUI(currentIndex);
    } catch (error) {
        console.error("Error loading songs:", error);
    }
}



/* ---------------- PLAY TRACK ---------------- */
function playTrack(index) {
    const previewUrl = tracks[index].previewUrl;
    if (!previewUrl) {
        alert('No preview available for this song');
        return;
    }

    audio.pause();
    audio = new Audio(previewUrl);
    audio.play();
    isPlaying = true;
    currentIndex = index;

    updatePlayerUI(index);
    startProgress();
    updatePlayButton();
}

/* ---------------- UPDATE PLAYER UI ---------------- */
function updatePlayerUI(index) {
    const item = document.querySelectorAll('.song-item')[index];
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    item?.classList.add('active');

    const track = tracks[index];

    document.querySelector('.player-song-title').textContent = track.trackName;
    document.querySelector('.player-song-artist').textContent = track.artistName;
    document.querySelector('.player-cover').src = track.artworkUrl100.replace("100x100", "400x400");
}

/* ---------------- PLAY/PAUSE BUTTON ---------------- */
const playButton = document.querySelector('.player-button.play');
playButton.addEventListener('click', () => {
    if (!audio.src) return;
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        clearInterval(progressInterval);
    } else {
        audio.play();
        isPlaying = true;
        startProgress();
    }
    updatePlayButton();
});

function updatePlayButton() {
    playButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

/* ---------------- NEXT / PREV ---------------- */
const nextBtn = document.querySelector('.fa-step-forward');
const prevBtn = document.querySelector('.fa-step-backward');

nextBtn.addEventListener('click', () => playTrack((currentIndex + 1) % tracks.length));
prevBtn.addEventListener('click', () => playTrack((currentIndex - 1 + tracks.length) % tracks.length));

/* ---------------- PROGRESS BAR ---------------- */
const progressBar = document.querySelector('.progress-bar-fill');
const currentTimeElem = document.querySelector('.progress-time:first-child');
const durationElem = document.querySelector('.progress-time:last-child');

function startProgress() {
    // Set duration (iTunes preview is 30s)
    const previewDuration = 30;
    audio.currentTime = 0;
    audio.play();

    // Update duration display
    const durMinutes = Math.floor(previewDuration / 60);
    const durSeconds = Math.floor(previewDuration % 60);
    durationElem.textContent = `${durMinutes}:${durSeconds < 10 ? '0' : ''}${durSeconds}`;

    // Use requestAnimationFrame for smooth progress update
    function update() {
        if (audio.paused) {
            requestAnimationFrame(update);
            return;
        }
        const elapsed = audio.currentTime;
        const progress = Math.min((elapsed / previewDuration) * 100, 100);
        progressBar.style.width = progress + '%';

        const displayMinutes = Math.floor(elapsed / 60);
        const displaySeconds = Math.floor(elapsed % 60);
        currentTimeElem.textContent = `${displayMinutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;

        if (progress < 100) {
            requestAnimationFrame(update);
        } else {
            playTrack((currentIndex + 1) % tracks.length); // auto play next
        }
    }
    requestAnimationFrame(update);
}


/* ---------------- INIT ---------------- */
window.onload = () => {
    // fetch_top_artist()
    loadSongs("Arjit Singh"); // default search
};

// const artist1 = document.querySelector("#weekend")
// artist1.addEventListener('click' ,()=> {
//     loadSongs("Dua Lipa")
// })
// const  artist_card= document.querySelector(".artist-card")
// let artistNames = document.querySelectorAll(".artist-name");
// artist_card.addEventListener('click' ,()=> {
//     loadSongs(artistNames.textContent)
//     console.log(artistNames.textContent)
// })
 const openBtn = document.getElementById("nav-item");
const closeBtn = document.getElementById("closeSearchBtn");
const overlay = document.getElementById("searchOverlay");

// openBtn.addEventListener("click", () => {
//   overlay.style.display = "block";
//   document.getElementById("searchInput").focus();
// });

// closeBtn.addEventListener("click", () => {
//   overlay.style.display = "none";
// });

// Handle Search (dummy data for now)
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    performSearch(e.target.value);
  }
});

function performSearch(query) {
  if (!query) return;

  // TODO: Replace with real API call
  const dummyResults = [
    { title: "Song A", artist: "Artist 1", id: "vid1" },
    { title: "Song B", artist: "Artist 2", id: "vid2" },
  ];

  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = dummyResults
    .map(
      (r) => `
        <div class="song">
          <span>${r.title} - ${r.artist}</span>
          <button onclick="playSong('${r.id}')">Play</button>
        </div>
      `
    )
    .join("");
}

function playSong(id) {
  console.log("Playing:", id);
  // hook into your player logic
}
// Arjit_singh


