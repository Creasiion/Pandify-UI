<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const playlists = ref([]);
const loading = ref(true);
const error = ref("");
const router = useRouter();

onMounted(async () => {
  loading.value = true;
  playlists.value = [];

  try {
    const response = await fetch("/playlists");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    playlists.value = data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load playlists.";
  } finally {
    loading.value = false;
  }
});

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div>
    <p v-if="loading">Loading playlists...</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else>
      <h1 v-if="playlists.length === 0">No playlists exist</h1>

      <div v-else>
        <h1>My Playlists</h1>
        <ul>
          <li v-for="playlist in playlists" :key="playlist._id">
            <h3
              style="cursor: pointer; text-decoration: underline"
              @click="navigateTo(`/edit/${playlist._id}`)"
            >
              {{ playlist.name }}
            </h3>
            <p>{{ playlist.isPublic ? "Public" : "Private" }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
