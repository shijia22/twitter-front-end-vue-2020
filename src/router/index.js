import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import AdminLogin from "../views/AdminLogin.vue";
import Login from "../views/Login.vue";
import NotFound from "../views/NotFound.vue";
import store from "./../store";

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/tweets/:id',
    name: 'tweets',
    component: () => import('../views/Tweets.vue'),
  },
  // {
  //   path: '/notify',
  //   name: 'notify',
  //   component: () => import('../views/Tweets.vue'),
  // },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/Chat.vue'),
  },
  // {
  //   path: '/message',
  //   name: 'message',
  //   component: () => import('../views/Message.vue'),
  // },
  {
    path: '/users/:userid',
    name: 'user',
    redirect: '/users/:userid/profile',
    component: () => import('../views/User.vue'),
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../components/UserTweets.vue'),
      },
      {
        path: 'replies',
        name: 'replies',
        component: () => import('../components/UserReplies.vue'),
      },
      {
        path: 'likes',
        name: 'likes',
        component: () => import('../components/UserLikes.vue'),
      },
    ],
  },
  {
    path: '/users/:userid/followers',
    name: 'followers',
    component: () => import('../views/UserFollowers.vue'),
  },
  {
    path: '/users/:userid/followings',
    name: 'followings',
    component: () => import('../views/UserFollowings.vue'),
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('../views/Setting.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/login',
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin,
  },
  {
    path: '/admin/tweets',
    name: 'admin-tweets',
    component: () => import('../views/AdminTweets.vue'),
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/AdminUsers.vue'),
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
]

const router = new VueRouter({
  routes,
  linkActiveClass: "router-link-active",
  linkActive: "router-link-exact-active",
});

//???????????????????????????????????????
router.beforeEach(async (to, from, next) => {
  const isAdminRoute = to.path.includes("admin");
  const isLoginRoute = to.path.includes("login");
  // ??? localStorage ?????? token
  const tokenInLocalStorage = localStorage.getItem("token");
  const tokenInStore = store.state.token;
  // ?????????????????????
  let isAuthenticated = store.state.isAuthenticated;
  let isAdmin = store.state.isAdmin;

  // ????????? token ???????????????
  // ?????? localStorage ??? store ?????? token ????????????
  if (tokenInLocalStorage && tokenInLocalStorage !== tokenInStore) {
    isAuthenticated = await store.dispatch("fetchCurrentUser");
    isAdmin = store.state.isAdmin;
  }
  // ?????? token ???????????????????????????
  if (!isAuthenticated && !isLoginRoute && to.name !== "register") {
    if (isAdminRoute) {
      next("/admin/login");
      return;
    } else {
      next("/login");
      return;
    }
  }
  //?????? token ??????????????????
  if (isAuthenticated) {
    if (isLoginRoute) {
      if (isAdminRoute) {
        //admin?????????
        if (isAdmin) {
          next("/admin/tweets"); //admin??????
          return;
        }
      } else {
        //???????????????
        if (!isAdmin) {
          next("/");
          return;
        }
      }
      //??????(admin) login route
    } else {
      //???login???, ???????????????
      if (isAdminRoute && !isAdmin) {
        next("/admin/login");
        return;
      } else if (!isAdminRoute && isAdmin) {
        next("/login");
        return;
      }
    }
  }
  next();
});

export default router;
