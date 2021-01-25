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
    // theme: '@vuepress/theme-blog',
    themeConfig: {
        logo: '/icon.jpg',
        nav: [ // 导航栏配置
            {text: '首页', link: '/'},
            {text: '前端', link: '/front/'},
            {text: '后端', link: '/back/'}
        ],
        sidebar: {
            '/back/': [
                {
                    title: 'JVM',
                    collapsable: true,
                    children: [
                        'JVM/JVM内存结构',
                        'JVM/虚拟机中的对象结构',
                        'JVM/垃圾收集策略与算法',
                        'JVM/内存分配与回收策略',
                        'JVM/类文件结构',
                        'JVM/类加载'
                    ]
                },
                {
                    title: 'Concurrency',
                    collapsable: true,
                    children: [
                        'Concurrency/volatile'
                        /*'线程池/虚拟机中的对象结构',
                        'JVM/垃圾收集策略与算法',
                        'JVM/内存分配与回收策略',
                        'JVM/类文件结构',
                        'JVM/类加载'*/
                    ]
                },
                {
                    title: 'Thread Pool',
                    collapsable: true,
                    children: [
                        'ThreadPool/Executors'
                        /*'线程池/虚拟机中的对象结构',
                        'JVM/垃圾收集策略与算法',
                        'JVM/内存分配与回收策略',
                        'JVM/类文件结构',
                        'JVM/类加载'*/
                    ]
                },
                {
                    title: 'Design Pattern'
                },
                {
                    title: 'Spring'
                },
                {
                    title: 'Mybatis'
                },
                {
                    title: 'Computer Network'
                },
                {
                    title: 'Linux'
                }
            ]
        },
        searchMaxSuggestions: 10
    },
    plugins: ['@vuepress/medium-zoom']
}