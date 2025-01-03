import Vue from 'vue';
import Router from 'vue-router';
import IndexPage from '@/components/IndexPage.vue';
import ResetPage from '@/components/ResetPage.vue';
import PandoraPage from '@/components/PandoraPage.vue';
import LoadingPage from '@/components/LoadingPage.vue';
import ClaudePage from '@/components/ClaudePage.vue';
import NaviPage from '@/components/NaviPage.vue';
import AccountPage from '@/components/AccountPage.vue';
import SharePage from '@/components/SharePage.vue';
import RedemptionPage from '@/components/RedemptionPage.vue';
import CarPage from '@/components/CarPage.vue';
import JumpPage from '@/components/Jump.vue';
import DrawPage from '@/components/DrawPage.vue';


Vue.use(Router);

const routes = [
    { path: '/', component: IndexPage, name: 'home', meta: { title: '首页' } },
    { path: '/account', component: AccountPage, name: 'account', meta: { title: '账号管理' }  },
    { path: '/share', component: SharePage, name: 'share', meta: { title: '分享管理' } },
    { path: '/redemption', component: RedemptionPage, name: 'redemption', meta: { title: '兑换码' } },
    { path: '/car', component: CarPage, name: 'car', meta: { title: '停车场' } },
    { path: '/jump', component: JumpPage, name: 'jump', meta: { title: '秋名山' } },
    { path: '/reset', component: ResetPage, name: 'reset', meta: { title: '重置密码' } },
    { path: '/pandora', component: PandoraPage, name: 'pandora', meta: { title: 'Pandora' } },
    { path: '/loading', component: LoadingPage, name: 'loading', meta: { title: 'Loading' } },
    { path: '/claude', component: ClaudePage, name: 'claude', meta: { title: 'Fuclaude' } },
    { path: '/navi', component: NaviPage, name: 'navi', meta: { title: 'Helper' } },
    { path: '/draw', component: DrawPage, name: 'draw', meta: { title: 'AI绘图' } },
    
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
        changeFavicon('favicon.svg')
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