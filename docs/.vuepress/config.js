module.exports = {
    title: 'RuleLau blog',
    description: '我的个人网站',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', {rel: 'icon', href: '/logo.ico'}], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    serviceWorker: true,
    base: '/', // 这是部署到github相关的配置
    markdown: {
        lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        logo: './logo.png',
        nav: [ // 导航栏配置
            {text: '首页', link: '/'},
            {text: '前端', link: '/front/'},
            {text: '后端', link: '/back/'},
            {text: 'GitHub', link: 'https://baidu.com'}
        ],
        sidebar: 'auto', // 侧边栏配置
        sidebarDepth: 2, // 侧边栏显示2级
    }
}