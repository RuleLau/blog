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
            // {text: '前端', link: '/front/'},
            {text: '后端', link: '/back/'}
        ],
        sidebar: {
            '/back/': [
                {
                    title: 'JVM',
                    collapsable: true,
                    children: [
                        'jvm/JMM',
                        'jvm/JVMStructure',
                        'jvm/GCAlgorithm',
                        'jvm/GC',
                        'jvm/MemoryAllocation',
                        'jvm/ClassStructure',
                        'jvm/ClassLoader'
                    ]
                },
                {
                    title: 'Concurrency',
                    collapsable: true,
                    children: [
                        'concurrency/Volatile',
                        'concurrency/Synchronized',
                        'concurrency/ThreadSafeStrategy'
                    ]
                },
                {
                    title: 'ThreadPool',
                    collapsable: true,
                    children: [
                        'threadPool/Executors',
                        'threadPool/ThreadPool01',
                        'threadPool/ThreadPool02',
                    ]
                },
                {
                    title: 'SpringCloud',
                    collapsable: true,
                    children: [
                        'springcloud/Oauth2-SSO'
                    ]
                },
                {
                    title: 'Design Pattern',
                    collapsable: true,
                    children: [
                        'design-pattern/abstract-factory',
                        'design-pattern/simple-factory',
                        'design-pattern/factory-method',
                        'design-pattern/simple-abstract-factory'
                    ]
                },
                {
                    title: 'Distributed-Transaction',
                    collapsable: true,
                    children: [
                        'distributed-transaction/Transaction',
                        'distributed-transaction/Seata'
                    ]
                },
                {
                    title: 'Docker',
                    collapsable: true,
                    children: [
                        'docker/install',
                        'docker/CentOS-Mysql'
                    ]
                },
                {
                    title: 'Utils',
                    collapsable: true,
                    children: [
                        'utils/ImgBed'
                    ]
                }
                /*{
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
                }*/
            ]
        },
        searchMaxSuggestions: 10,
        lastUpdated: 'Last Updated'
    },
    plugins: ['@vuepress/medium-zoom']
}