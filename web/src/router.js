/*=========================================================================================
  File Name: router.js
  Description: Routes for vue-router. Lazy loading is enabled.
  Object Strucutre:
                    path => router path
                    name => router name
                    component(lazy loading) => component to load
                    meta : {
                      rule => which user can have access (ACL)
                      breadcrumb => Add breadcrumb to specific page
                      pageTitle => Display title besides breadcrumb
                    }
  ----------------------------------------------------------------------------------------
  Item Name: Vuesax Admin - VueJS Dashboard Admin Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/


import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [

    {
      // =============================================================================
      // MAIN LAYOUT ROUTES
      // =============================================================================
      path: '',
      component: () => import('./layouts/main/Main.vue'),
      children: [
        // =============================================================================
        // Theme Routes
        // =============================================================================
        {
          path: '/',
          name: 'home',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/Home.vue')
        },
        {
          path: '/eqRegis',
          name: 'Equipment Register',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/EqRegister/EqRegister.vue')
        },
        {
          path: '/eqGrouping',
          name: 'Equipment Grouping',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/EqGrouping/eqGrouping.vue')
        },
        {
          path: '/uploadVideo',
          name: 'Upload Video',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/uploadVideo/uploadVideo.vue')
        },
        {
          path: '/eqStatus',
          name: 'Equipment Status',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/eqStatus/eqStatus.vue')
        },
        {
          path: '/userManage',
          name: 'User Manage',
          meta: {
            rule: 'isPublic',
            requiresAuth: true,
          },
          component: () => import('./views/usesrManage/userManage.vue')
        },
      ],
    },
    // =============================================================================
    // FULL PAGE LAYOUTS
    // =============================================================================
    {
      path: '',
      component: () => import('@/layouts/full-page/FullPage.vue'),
      children: [
        // =============================================================================
        // PAGES
        // =============================================================================
        {
          path: '/pages/login',
          name: 'pageLogin',
          meta: {
            rule: 'isPublic',
          },
          component: () => import('@/views/pages/Login.vue')
        },
        {
          path: '/pages/error-404',
          name: 'pageError404',
          meta: {
            rule: 'isPublic',
          },
          component: () => import('@/views/pages/Error404.vue')
        },
      ]
    },
    // Redirect to 404 page, if no match found
    {
      path: '*',
      redirect: '/pages/error-404'
    }
  ],
})

router.afterEach(() => {
  // Remove initial loading
  const appLoading = document.getElementById('loading-bg')
  if (appLoading) {
    appLoading.style.display = "none";
  }
})

export default router
