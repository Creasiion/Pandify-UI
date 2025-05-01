<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const playlistId = route.params.id; // Get the playlist ID from the route

const albums = ref([]);
const albumTracks = ref([])
const name = ref("");
const isPublic = ref(true);
const playlistTracks = ref([]); //Tracks inside the playlist
const selectedTrackIds = ref([]); //Tracks selected to add to the playlist
const error = ref("");
const loading = ref(true);


// Fetch playlist data - Outside of onMounted to allow for refreshing in other functions
const fetchPlaylistData = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(`/playlists/${playlistId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    name.value = data.name;
    isPublic.value = data.isPublic;
    playlistTracks.value = data.tracks.map(trackId => {
      for (const album of albums.value) {
        const foundTrack = albumTracks.value[album.id]?.find(track => `${album.id}|${track.trackNumber}` === trackId);
        if (foundTrack) return { ...foundTrack, id: trackId };
      }
      return { name: "Unknown Track", primaryArtist: "Unknown Artist" }; // Handle missing tracks
    });
  } catch (err) {
    console.error(err);
    error.value = "Failed to load playlist.";
  } finally {
    loading.value = false;
  }
};


onMounted(async () => {
  loading.value = true;
  error.value = "";

  //Fetching albums
  try {
    const response = await fetch("/albums");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    albums.value = data;
    console.log("Albums data:", albums.value);
  } catch (err) {
    console.error(err);
    error.value = "Failed to load albums.";
  } finally {
    loading.value = false;
  }

  for (const album of albums.value) {
    await fetchTracksForAlbum(album.id);
  }

  loading.value = false;

  // Fetch playlist data
  await fetchPlaylistData();
});

//Fetching tracks
const fetchTracksForAlbum = async (albumId) => {
  if (albumTracks.value[albumId]) return; // Prevent duplicate fetch

  try {
    const response = await fetch(`/albums/${albumId}/tracks`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    albumTracks.value[albumId] = data;

  } catch (err) {
    console.error(`Error fetching tracks for album ${albumId}:`, err);
  }
};

//Change privacy of the playlist
const togglePrivacy = async () => {
  try {
    const response = await fetch(`/playlists/${playlistId}/isPublic`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(!isPublic.value), // Toggle the value
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(`Playlist privacy updated to ${!isPublic.value ? "Private" : "Public"}`);
    
    isPublic.value = !isPublic.value;
  } catch (err) {
    console.error("Error updating playlist privacy:", err);
  }
};


// Adds all selected songs to playlist
  const addTrackToPlaylist = async () => {
  if (selectedTrackIds.value.length === 0) {
    console.warn("No new tracks selected.");
    return;
  }

  try {
    for (const trackId of selectedTrackIds.value) { // For loop to go through each selected track
      const requestBody = JSON.stringify({ trackId });
      console.log("Sending track:", requestBody);

      const response = await fetch(`/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      console.log(`Track ${trackId} added successfully!`);
    }

    // Clear selected tracks after updating
    selectedTrackIds.value = [];

    // Refresh playlist after updating
    await fetchPlaylistData();
  } catch (err) {
    console.error("Error updating playlist:", err);
  }
};

// Remove a track from the playlist
const removeTrackFromPlaylist = async (trackId) => {
  try {
    const response = await fetch(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    console.log("Track removed from playlist");

    // Refresh playlist after updating
    await fetchPlaylistData();
  } catch (err) {
    console.error("Error removing track from playlist:", err);
  }
};

const moveTrack = async (trackId, newPos) => {
  try {
    const requestBody = JSON.stringify({ trackId, position: newPos });
    console.log("Sending move request:", requestBody);

    const response = await fetch(`/playlists/${playlistId}/tracks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

    console.log(`Track ${trackId} moved to position ${newPos}`);

    // Refresh the playlist after moving
    await fetchPlaylistData();
  } catch (err) {
    console.error("Error moving track:", err);
  }
};

</script>

<template>
  <div>
    <h1>Edit Playlist</h1>

    <p v-if="loading">Loading playlist...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <form v-if="!loading" @submit.prevent="handleUpdate">
      <h2>Playlist Name: {{ name }}</h2>
      <label>
        <button :class="isPublic ? 'public' : 'private'" @click="togglePrivacy">
            {{ isPublic ? "Public" : "Private" }}
          </button>
      </label>

      <h2>Tracks in Playlist</h2>
      <ul>
        <li v-for="(track, index) in playlistTracks" :key="track.id">
          
          <!-- Remove Track -->
          <button @click="removeTrackFromPlaylist(track.id)">Remove</button>

          {{ track.name }} - {{ track.primaryArtist }}

          <!-- Move Up (Disabled for first track) -->
          <button @click="moveTrack(track.id, index - 1)" :disabled="index === 0">
            ⬆
          </button>

          <!-- Move Down (Disabled for last track) -->
          <button @click="moveTrack(track.id, index + 1)" :disabled="index === playlistTracks.length - 1">
            ⬇
          </button>
        </li>
      </ul>


      <h2>Available Albums & Tracks</h2>
      <ul>
        <div v-for="album in albums" :key="album.id" class="album-container">
          <h3><strong>{{ album.name }}</strong></h3>

          <div v-if="albumTracks[album.id]">
            <div v-for="track in albumTracks[album.id]" :key="track.id">
              <input type="checkbox" :value="`${album.id}|${track.trackNumber}`" v-model="selectedTrackIds"/>
              {{ track.name }} - {{ track.primaryArtist }}
            </div>
          </div>
          <p v-else>Loading tracks...</p>
        </div>
      </ul>

      <!-- Add to Playlist Button -->
      <button @click="addTrackToPlaylist" :disabled="selectedTrackIds.length === 0">
        Add Tracks to Playlist
      </button>
    </form>
    <!-- Return Button - Will Update privacy, removed tracks, and placement -->
    <button @click="router.push('/')">Return</button>
  </div>
</template>

<style scoped>
.public {
  background-color: rgb(38, 185, 38);
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}

.private {
  background-color: rgb(63, 73, 215);
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}

button:hover {
  opacity: 0.8;
}
</style>
