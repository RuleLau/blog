### 安装centos7并使用xshell连接

1. 拉取centos7镜像：`docker pull centos`
2. 启动centos7镜像，如果不指定/bin/bash，容器运行后会自动停止：`docker run -d -i -t <IMAGE ID> /bin/bash`, 首先输入 `docker ps`查看镜像的id，接着运行 `docker run -it -p 50001:22 --privileged centos /usr/sbin/init` 将22端口映射为本地的50001端口，后面使用xshell登录,端口为50001
3. 进入centos7容器：`docker exec -it 84314aaa1ec6 /bin/bash`，84314aaa1ec6为容器id
4. 安装ssh必备的东西：
```
yum install net-tools.x86_64
 yum install -y openssh-server
```
5. 修改配置文件 `vi /etc/ssh/sshd_config`，端口为22
6. 启动服务：`systemctl start sshd`
7. 安装并设置centos的密码：`yum install passwd -y `: 安装密码服务，
设置密码：`passwd`: 设置系统root用户密码，输入两次密码成功
7. 使用xshell进行链接，通过windos10系统使用xshell连接docker的centos7系统 ，IP是windows10系统的IP，端口为运行容器的主机端口，在这里是50001,输入用户名、密码，连接成功.
![image](https://i.bmp.ovh/imgs/2021/03/8dc9cd061b6697c4.png) 
> 安装过程可能会出现网络问题，因为我本地设置了代码，所以需要centos中设置网络代理

### 在centos中安装docker
1. 更新源：`yum update`, 谨慎使用不要用于生产环境
2. 安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的：`yum install -y yum-utils device-mapper-persistent-data lvm2`
3. 设置yum源（选择其中一个）：我选择是aliyun
```
# 中央仓库
yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo
# 阿里仓库
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```
4. 查看所有仓库中所有docker版本，并选择特定版本安装：`yum list docker-ce --showduplicates | sort -r`
![](https://i.bmp.ovh/imgs/2021/03/c0973ef3b48fcfdf.png)
5. 安装docker，期间一直按y即可

```
#安装最新版本(推荐)
yum install docker-ce
#安装特定版本
yum install docker-ce-版本号
# 例如
yum install docker-ce-18.06.3.ce
```
6. 验证安装完成：`docker --version`
7. docker常用命令

```
docker ps 查看当前正在运行的容器
docker ps -a 查看所有容器的状态
docker start/stop id/name 启动/停止某个容器
docker attach id 进入某个容器(使用exit退出后容器也跟着停止运行)
docker exec -ti id 启动一个伪终端以交互式的方式进入某个容器（使用exit退出后容器不停止运行）
docker images 查看本地镜像
docker rm id/name 删除某个容器
docker rmi id/name 删除某个镜像
#  复制ubuntu容器并且重命名为test且运行，然后以伪终端交互式方式进入容器，运行bash
docker run --name test -ti ubuntu /bin/bash 
docker build -t soar/centos:7.1 .  通过当前目录下的Dockerfile创建一个名为soar/centos:7.1的镜像
# 以镜像soar/centos:7.1创建名为test的容器，并以后台模式运行，并做端口映射到宿主机2222端口，P参数重启容器宿主机端口会发生改变
docker run -d -p 2222:22 --name test soar/centos:7.1
```

### 安装mysql
- 下载mysql
`docker pull mysql8.0`

- 在本地目录增加mysql的数据目录和配置文件映射
```
docker run -it -v D:/software/mysql/data:/var/lib/mysql -v D:/software/mysql/config/my.cnf:/etc/my.cnf -v D:/software/mysql/priv:/var/lib/priv --restart=always --name mysql8.0 -e MYSQL_ROOT_PASSWORD=6789@jkl -p 3306:3306 -d mysql:8.0 --lower-case-table-names=1
```

- 进入mysql 修改配置
```
docker exec -it mysql8.0 bash
mysql -u root -p
select host,user,plugin,authentication_string from mysql.user;
-- localhost为只有本机能进行登录，改成为%
ALTER user 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '6789@jkl';
```

- 登录docker中的mysql

```
docker exec -it mysql8.0 bash
mysql -u root -p
use mysql;
update user set host = '%' where user = 'root'; 
查询是否修改成功：
select host, user from user;
```
