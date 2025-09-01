/* ---------------- CONFIG ---------------- */
let tracks = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;
let progressInterval;

// player-cover
//api fetch last fm
// popular artists


// const API_URL = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";

// async function searchSongs(query) {
//     try {
//         let res = await fetch(API_URL + encodeURIComponent(query));
//         let data = await res.json();

//         // console.log(data); // see structure in console

//         // Example: display first 5 results
//         let resultsDiv = document.getElementById("searchResults");
//         resultsDiv.innerHTML = "";

//         data.data.results.slice(0, 5).forEach(song => {
//             let songDiv = document.createElement("div");
//             songDiv.classList.add("song-item");

//             // Song name + image + play button
//             songDiv.innerHTML = `
//                 <img src="${song.image}" width="50"/>
//                 <span>${song.title} - ${song.more_info.singer}</span>
//                 <button onclick="playSong('${song.more_info.encrypted_media_url}')">▶</button>
//             `;
//             resultsDiv.appendChild(songDiv);
//         });
//     } catch (err) {
//         console.error("Error fetching songs:", err);
//     }
// }

let _audio = new Audio();

function playSong(url) {
    // Usually you need to decode or fetch actual mp3 link
    _audio.src = url;
    _audio.play();
}
// searchSongs("The Weeknd");



const artistContainer = document.getElementById("artist-container");
const nextArtist = document.getElementById("nextArtist");
const prevArtist = document.getElementById("prevArtist");

let scrollAmount = 0;
const scrollStep = 250; // adjust movement per click

nextArtist.addEventListener("click", () => {
    artistContainer.scrollBy({ left: scrollStep, behavior: "smooth" });
});

prevArtist.addEventListener("click", () => {
    artistContainer.scrollBy({ left: -scrollStep, behavior: "smooth" });
});


const cards = document.querySelectorAll(".artist-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        console.log("Card clicked");
        const artistName = card.querySelector(".artist-name").textContent.toString();
        console.log("Clicked artist:",{artistName});
        loadSongs(artistName)
        // You can use artistName here (show in player, search songs, etc.)
      });
    });
const container = document.getElementById("artist-container");
const apiKey="919dbfaa6b84bfe9b7fb4a43a75f13f9"
// const lastfm_url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=india&api_key=${apiKey}&format=json&limit=6`;

/* ---------------- FETCH SONGS (iTunes API) ---------------- */
async function fetchSongs(query = "The Weeknd") {
    let url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10&country=US`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
}



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


    document.querySelector(".featured-playlist").addEventListener('click', () => {
        loadSongs("Summer Vibes")});
    


    
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
    document.querySelector('#player-song-title').textContent = track.trackName;
    document.querySelector('#player-song-artist').textContent = track.artistName;
    document.querySelector('.player-cover').src = track.artworkUrl100.replace("100x100", "400x400");
    document.querySelector('.player-cover_small').src = track.artworkUrl100.replace("100x100", "400x400");
}
// console.log(tracks.trackName,"hello");
/* ---------------- PLAY/PAUSE BUTTON ---------------- */
const playButton = document.querySelector('.player-button.play');
playButton.addEventListener('click', () => {
    if (!audio.src) return;
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        // clearInterval(progressInterval);
    } else {
        audio.play();
        isPlaying = true;
        // startProgress();
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
// const openBtn = document.getElementById("openSearchBtn");
// const closeBtn = document.getElementById("closeSearchBtn");
// const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
let debounceTimer;

// openBtn.addEventListener("click", () => {
//   searchBar.classList.add("active");
//   document.getElementById("searchInput").focus();
// });

// closeBtn.addEventListener("click", () => {
//   searchBar.classList.remove("active");
// });

const buttons = document.querySelectorAll(".nav-item");

  buttons.forEach(btn => {
    btn.addEventListener("click", function() {
      // remove active from all
      buttons.forEach(b => b.classList.remove("active"));
      // add active to the clicked one
      this.classList.add("active");
    });
  });


searchInput.addEventListener("input", function() {
  clearTimeout(debounceTimer);
  const query = this.value.trim();
  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }
    // Example: call your API
    debounceTimer = setTimeout(() => {
    loadSongs(query);
  }, 700);
});


const right_panel_button=document.querySelector("#right-panel-button")
const right_panel=document.querySelector(".right-panel")
right_panel_button.addEventListener("click",()=>{
  // alert("geloo")
  right_panel.style.display = "none";
  

})

// function performSearch(query) {
//   if (!query) return;

//   // TODO: Replace with real API call
//   /* The `const dummyResults` array is storing dummy data for search results. Each object in the array
//   represents a song with properties like `title`, `artist`, and `id`. This data is used to simulate
//   search results in the application for testing purposes. */
//   const dummyResults = [
    
//   ];

//   const resultsDiv = document.getElementById("searchResults");
//   resultsDiv.innerHTML = dummyResults
//     .map(
//       (r) => `
//         <div class="song">
//           <span>${r.title} - ${r.artist}</span>
//           <button onclick="playSong('${r.id}')">Play</button>
//         </div>
//       `
//     )
//     .join("");
// }

// function playSong(id) {
//   console.log("Playing:", id);
//   // hook into your player logic
// }
// const audio = document.getElementById("audioPlayer");
const volumeBar = document.querySelector(".volume-bar");
const volumeFill = document.querySelector(".volume-bar-fill");
const mute = document.querySelector("#mute");
// default volume
audio.volume = 1;

mute.addEventListener("click", () => {
  console.log("Mute clicked");
  if (audio.volume > 0) {
    audio.volume = 0;
    // volumeFill.style.width = "0%";
    mute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
  } else {
    audio.volume = 1;
    // volumeFill.style.width = "100%";
    mute.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
});

volumeBar.addEventListener("click", (e) => {
  const barWidth = volumeBar.clientWidth;
  const clickX = e.offsetX;
  const volume = clickX / barWidth;

  audio.volume = volume;
  volumeFill.style.width = (volume * 100) + "%";
});

// Example: play a song from API
// function playSong(songUrl, cover, title, artist) {
//   audio.src = songUrl;
//   audio.play();

//   // Update Now Playing UI
//   document.querySelector(".player-song-title").textContent = title;
//   document.querySelector(".player-song-artist").textContent = artist;
//   document.querySelector(".player-song-info img").src = cover;
// }
