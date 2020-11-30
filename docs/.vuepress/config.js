module.exports = {
    title: 'RuleLau\'s Blog',
    description: '我的个人网站',
    sidebar: 'auto',
    head: [
        ['link', {rel: 'icon', href: '/icon.jpg'}],
    ],
    port: 9999,
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    serviceWorker: true,
    base: '/',
    markdown: {
        lineNumbers: false
    },
    themeConfig: {
        logo: '/icon.jpg',
        nav: [ // 导航栏配置
            {text: '首页', link: '/'},
            {text: '前端', link: '/front/'},
            {text: '后端', link: '/back/'}
        ],
        sidebar: 'auto',
        sidebarDepth: 2,
        searchMaxSuggestions: 10
    },
    plugins: ['@vuepress/medium-zoom']
}