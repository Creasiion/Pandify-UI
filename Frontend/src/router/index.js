/* import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router */
import { createRouter, createWebHistory } from "vue-router";
import Playlists from "../components/pages/Playlists.vue";
import EditPlaylist from "../components/pages/EditPlaylist.vue";
import NewPlaylist from "../components/pages/NewPlaylist.vue";

const routes = [
  { path: "/", component: Playlists },
  { path: "/edit/:id", component: EditPlaylist },
  { path: "/new", component: NewPlaylist }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

