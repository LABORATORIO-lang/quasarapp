import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import localforage from 'localforage'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const publicas = ['/', '/register', '/forgot-password']
    if (publicas.includes(to.path)) return next()

    if (to.path.startsWith('/verificacao/')) return next()

    const sessao = (await localforage.getItem('user_session')) || {}
    const perfis = sessao.perfis || []

    if (perfis.length === 0) return next()

    if (perfis.includes('master') || perfis.includes('admin')) return next()

    const perfisPermitidos = to.meta?.perfis || []
    if (perfisPermitidos.length === 0) return next()

    const temPermissao = perfis.some((p) => perfisPermitidos.includes(p))
    if (temPermissao) return next()

    next('/inicio')
  })

  return Router
})
