<template>
    <div class="fd-top"  title="回到顶部" v-show="goTop" @click="toTop">Top</div>
</template>

<script>
    export default {
        name: 'go-top',
        data() {
            return {
                goTop: false
            };
        },
        methods: {
            handleScroll() {
                debugger
                let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                this.goTop = scrollTop > 30;
            },
            toTop() {
                let top = document.documentElement.scrollTop || document.body.scrollTop;
                // 实现滚动效果
                const timeTop = setInterval(() => {
                    document.body.scrollTop = document.documentElement.scrollTop = top -= 200;
                    if (top <= 0) {
                        clearInterval(timeTop);
                    }
                }, 10);
            }
        },
        mounted() {
            window.addEventListener("scroll", this.handleScroll, true);
        }
    }
</script>

<style scoped>
    .fd-top {
        text-align: center;
        position: fixed;
        right: 50px;
        bottom: 30px;
        cursor: pointer;
        padding: 10px;
        border-radius: 50%;
        background: white;
        color: #000000;
    }
</style>