import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import FilePage from '../pages/FilePage.vue'
import FolderPage from '../pages/FolderPage.vue'
import AdminPanel from '../pages/AdminPanel.vue'
import { useAuthStore } from '@/stores/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPanel,
    // meta: { requiresAdmin: true },
  },
  {
    path: '/files/:id',
    name: 'File',
    component: FilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/folders/:id',
    name: 'Folder',
    component: FolderPage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next({ name: 'Login' })
      return
    }

    // Check if route requires admin role
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!user.isAdmin) {
        next({ name: 'Home' })
        return
      }
    }
  }

  // If on login page and already authenticated, redirect to home
  if (to.name === 'Login' && user) {
    next({ name: 'Home' })
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router 
