<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const isPublic = ref(true);
const error = ref("");
const router = useRouter();

const handleSave = async (e) => {
  e.preventDefault();
  error.value = "";

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      isPublic: isPublic.value,
    }),
  };

  try {
    const response = await fetch("/playlists", requestOptions);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    router.push("/");
  } catch (err) {
    console.error("Error creating playlist:", err);
    error.value = "Failed to create playlist. Please try again.";
  }
};
</script>

<template>
  <div>
    <h1>Create New Playlist</h1>

    <p v-if="error" style="color: red">{{ error }}</p>

    <form @submit="handleSave">
      <label>
        Playlist Name:
        <input type="text" v-model="name" required />
      </label>

      <label>
        <input type="checkbox" v-model="isPublic" />
        Public
      </label>

      <button type="submit">Create Playlist</button>
    </form>

    <button @click="router.push('/')">Cancel</button>
  </div>
</template>

<style scoped>
/* Add styles if needed */
</style>
