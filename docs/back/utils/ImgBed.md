### 搭建私人图床（Gitee + PicGo + Typora）



#### 1. 原由

今天突然想要好好写下博客，使用MarkDown进行编写，发现每次截图的图片只能保存在本地上，想要放到网上访问就不行了，每次都要复制图片到免费的图床网站上，十分的麻烦，所以今天准备去弄一个私人的图床工具。

#### 2. 选型

一搜发现很多采用Github，但是考虑到Github访问不稳定，就采用的是Gitee，国内的开源仓库

### 3. 开始搭建

#### 1. 搭建Gitee 图床仓库

##### 	1.1 打开自己的Gitee仓库，创建一个Gitee仓库，并且为public。

![image-20210405111019534](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405111019534.png)

##### 	1.2 获取私人令牌

​	在点开 Gitee 的 设置，然后选择`私人令牌`，`生成新令牌`，最后填写描述信息，接着提交即可。将 生成的 私人令牌进行保存，等下需要使用。

![image-20210405111211740](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405111211740.png)

#### 2. 首先下载PicGo

下面的连接是已经下载好了的，`https://download.csdn.net/download/LarrYFinal/16457159`,下载好后直接安装运行即可。

##### 	2.1 配置Gitee插件、配置信息

安装如下图，然后重新启动下PicGo，直接在任务栏右键重启即可。启动后可以看到图床设置中有了Gitee

![image-20210405111426901](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405111426901.png)

选择图床设置中的`gitee`， 根据下图进行设置。

![image-20210405111630792](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405111630792.png)

##### 	2.2 测试上传

接下里可以在`上传区`进行测试了，上传一张图片，然后刷新下自己的Gitee图床仓库中是否存在即可。存在的话代表已经配置完成了。每一次上传，也会进行提示是否上传成功。



#### 3. 配置Typora

​	配置Typora主要是用于，我们在写Markdown 时，可以直接截图，然后粘贴到我们的文件中，其中的图片地址就不再是我们本地图片地址了，而直接会被转换为Gitee图床中的地址。

##### 	3.1 配置Typora 上传

点击`文件`、`偏好设置`，然后根据下图进行配置

![image-20210405112245732](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405112245732.png)

##### 	3.2 测试

​	随便截图，然后粘贴到Typora中，看下图片url地址是不是就远端仓库中的了。

![image-20210405112421147](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405112421147.png)