import Vue from 'vue';
import Router from 'vue-router';
import IndexPage from '@/components/IndexPage.vue';
import ResetPage from '@/components/ResetPage.vue';
import PandoraPage from '@/components/PandoraPage.vue';
import LoadingPage from '@/components/LoadingPage.vue';
import ClaudePage from '@/components/ClaudePage.vue';
import NaviPage from '@/components/NaviPage.vue';
import AccountPage from '@/components/AccountPage.vue';


Vue.use(Router);

const routes = [
    { path: '/', component: IndexPage, name: 'home', meta: { title: '首页' } },
      { path: '/account', component: AccountPage, name: 'account' },
    { path: '/reset', component: ResetPage, name: 'reset', meta: { title: '重置密码' } },
    { path: '/pandora', component: PandoraPage, name: 'pandora', meta: { title: 'Pandora' } },
    { path: '/loading', component: LoadingPage, name: 'loading', meta: { title: 'Loading' } },
    { path: '/claude', component: ClaudePage, name: 'claude', meta: { title: 'Fuclaude' } },
    { path: '/navi', component: NaviPage, name: 'navi', meta: { title: 'Navigator' } },
    // 你可以继续添加其他路由
];

const router = new Router({
    mode: 'history',
    routes,
});

router.beforeEach((to, from, next) => {
    // 如果路由元信息中定义了标题，设置 document.title
    if (to.meta.title) {
        document.title = to.meta.title;
        changeFavicon('../assets/humbleicons--coffee.svg')
    } else {
        document.title = 'Pandora'; // 可以设置一个默认标题
    }
    next();
});

function changeFavicon(faviconURL) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconURL;
    link.type = 'iamge/svg+xml';
}
export default router