# 分布式事务解决框架 Seata + SpringCloud + Nacos



## 一、搭建 Seata + Nacos

1. 从官网下载 Seata 的源码包和执行文件，由于文件都是在Github托管，可以从下面地址下载：`https://download.csdn.net/download/LarrYFinal/16515872`

2. 修改配置文件  registry.conf、file.conf、conf.txt

   1. 修改registry.conf，使用的是Nacos作配置中心和注册中心

      ```
      registry {
        # file 、nacos 、eureka、redis、zk、consul、etcd3、sofa
        type = "nacos"
        loadBalance = "RandomLoadBalance"
        loadBalanceVirtualNodes = 10
        nacos {
          application = "seata-server"
          serverAddr = "127.0.0.1:8848"
          group = "SEATA_GROUP"
          namespace = "public"
          cluster = "default"
          username = "nacos"
          password = "nacos"
        }
      }
      
      config {
        # file、nacos 、apollo、zk、consul、etcd3
        type = "nacos"
        nacos {
          serverAddr = "127.0.0.1:8848"
          namespace = "public"
          group = "SEATA_GROUP"
          username = "nacos"
          password = "nacos"
        }
      }
      ```

   2. 修改 file.conf

      ```
      ## transaction log store, only used in seata-server
      store {
        ## store mode: file、db、redis
        mode = "db"
        ## database store property
        db {
          ## the implement of javax.sql.DataSource, such as DruidDataSource(druid)/BasicDataSource(dbcp)/HikariDataSource(hikari) etc.
          datasource = "druid"
          ## mysql/oracle/postgresql/h2/oceanbase etc.
          dbType = "mysql"
          driverClassName = "com.mysql.cj.jdbc.Driver"
          url = "jdbc:mysql://127.0.0.1:3306/seata?characterEncoding=UTF8&useSSL=false&serverTimezone=Asia/Shanghai"
          user = "root"
          password = "123456"
          minConn = 5
          maxConn = 100
          globalTable = "global_table"
          branchTable = "branch_table"
          lockTable = "lock_table"
          queryLimit = 100
          maxWait = 5000
        }
      }
      ```

   3. 修改config.txt (位于源码包中\seata-1.4.1-source\script\config-center\config.txt)

      ```
      service.vgroupMapping.my_test_tx_group=default
      service.default.grouplist=127.0.0.1:8091
      service.enableDegrade=false
      service.disableGlobalTransaction=false
      store.mode=db
      store.db.datasource=druid 
      store.db.dbType=mysql 
      store.db.driverClassName=com.mysql.cj.jdbc.Driver
      store.db.url=jdbc:mysql://127.0.0.1:3306/seata?characterEncoding=UTF8&useSSL=false&serverTimezone=Asia/Shanghai
      store.db.user=root 
      store.db.password=123456 
      store.db.minConn=5 
      store.db.maxConn=30 
      store.db.globalTable=global_table 
      store.db.branchTable=branch_table 
      store.db.queryLimit=100 
      store.db.lockTable=lock_table 
      store.db.maxWait=5000
      ```

3. 初始化数据库脚本（源码包中路径）

   1. 在路径`\seata-1.4.1-source\script\server\db\mysql.sql`,执行下面的脚本，记住是seata模式下

      ```
      -- -------------------------------- The script used when storeMode is 'db' --------------------------------
      -- the table to store GlobalSession data
      CREATE TABLE IF NOT EXISTS `global_table`
      (
          `xid`                       VARCHAR(128) NOT NULL,
          `transaction_id`            BIGINT,
          `status`                    TINYINT      NOT NULL,
          `application_id`            VARCHAR(32),
          `transaction_service_group` VARCHAR(32),
          `transaction_name`          VARCHAR(128),
          `timeout`                   INT,
          `begin_time`                BIGINT,
          `application_data`          VARCHAR(2000),
          `gmt_create`                DATETIME,
          `gmt_modified`              DATETIME,
          PRIMARY KEY (`xid`),
          KEY `idx_gmt_modified_status` (`gmt_modified`, `status`),
          KEY `idx_transaction_id` (`transaction_id`)
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8;
      
      -- the table to store BranchSession data
      CREATE TABLE IF NOT EXISTS `branch_table`
      (
          `branch_id`         BIGINT       NOT NULL,
          `xid`               VARCHAR(128) NOT NULL,
          `transaction_id`    BIGINT,
          `resource_group_id` VARCHAR(32),
          `resource_id`       VARCHAR(256),
          `branch_type`       VARCHAR(8),
          `status`            TINYINT,
          `client_id`         VARCHAR(64),
          `application_data`  VARCHAR(2000),
          `gmt_create`        DATETIME(6),
          `gmt_modified`      DATETIME(6),
          PRIMARY KEY (`branch_id`),
          KEY `idx_xid` (`xid`)
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8;
      
      -- the table to store lock data
      CREATE TABLE IF NOT EXISTS `lock_table`
      (
          `row_key`        VARCHAR(128) NOT NULL,
          `xid`            VARCHAR(96),
          `transaction_id` BIGINT,
          `branch_id`      BIGINT       NOT NULL,
          `resource_id`    VARCHAR(256),
          `table_name`     VARCHAR(32),
          `pk`             VARCHAR(36),
          `gmt_create`     DATETIME,
          `gmt_modified`   DATETIME,
          PRIMARY KEY (`row_key`),
          KEY `idx_branch_id` (`branch_id`)
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8;
      ```

   2. 在路径`\seata-1.4.1-source\script\client\at\db\mysql.sql`,初始化客户端SQL脚本，这里是 test模式下

      ```
      -- for AT mode you must to init this sql for you business database. the seata server not need it.
      CREATE TABLE IF NOT EXISTS `undo_log`
      (
          `branch_id`     BIGINT(20)   NOT NULL COMMENT 'branch transaction id',
          `xid`           VARCHAR(100) NOT NULL COMMENT 'global transaction id',
          `context`       VARCHAR(128) NOT NULL COMMENT 'undo_log context,such as serialization',
          `rollback_info` LONGBLOB     NOT NULL COMMENT 'rollback info',
          `log_status`    INT(11)      NOT NULL COMMENT '0:normal status,1:defense status',
          `log_created`   DATETIME(6)  NOT NULL COMMENT 'create datetime',
          `log_modified`  DATETIME(6)  NOT NULL COMMENT 'modify datetime',
          UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
      ) ENGINE = InnoDB
        AUTO_INCREMENT = 1
        DEFAULT CHARSET = utf8 COMMENT ='AT transaction mode undo table';
      ```

4. 上传配置到Nacos并启动Seata-Server

   1. 上传配置

      启动Nacos，然后在`\seata-1.4.1-source\script\config-center\nacos`路径下，执行`nacos-config.sh`，打开Git Bash，然后输入`sh nacos-config.sh`

      ![image-20210408222345416](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408222345416.png)

      ![image-20210408222734149](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408222734149.png)

   2. 启动Seata-Server，在下载好的直接运行的 Seata包中，路径为`D:\Software\seata\bin`，直接双击seata-server.bat.

## Spring Cloud 集成 Seata

1. 配置Spring Cloud 服务 application.yml

   1. 两个客户端，一个是消息生产者`nacos-service-provider`，一个是消息消费者`nacos-service-consumer`。分别配置它们的 application.yml

   2. `nacos-service-provider` application.yml

      ```
      server:
        port: 8081
      #Seata分布式事务配置(AT模式)
      seata:
        enabled: true
        application-id: nacos-service-provider
        tx-service-group: my_test_tx_group
        config:
          type: nacos
          nacos:
            server-addr: 127.0.0.1:8848
            group: SEATA_GROUP
            username: ""
            password: ""
        registry:
          type: nacos
          nacos:
            application: seata-server
            server-addr: 127.0.0.1:8848
            group : "SEATA_GROUP"
            username: ""
            password: ""
      ```

   3. `nacos-service-consumer` application.yml

      ```
      server:
        port: 8082
      seata:
        enabled: true
        application-id: nacos-service-consumer
        tx-service-group: my_test_tx_group
        config:
          type: nacos
          nacos:
            server-addr: 127.0.0.1:8848
            group: SEATA_GROUP
            username: ""
            password: ""
        registry:
          type: nacos
          nacos:
            application: seata-server
            server-addr: 127.0.0.1:8848
            group : "SEATA_GROUP"
            username: ""
            password: ""
      ```

2. 启动项目，此时在Nacos中有三个服务已经注册在上面

   ![image-20210408223810756](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408223810756.png)



## 实践

> 前提：nacos-service-provider 发送消息告诉 nacos-service-consumer，增加用户信息。此时需要在 provider 端增加一条消息发送记录，然后再 consumer 端再增加一条用户信息。

### 依赖文件

Provider、Consumer 都是一样

```
依赖版本
<dependencyManagement>
    <!--springcloud-->
    <dependencies>
    <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-dependencies</artifactId>
    <version>Hoxton.SR5</version>
    <type>pom</type>
    <scope>import</scope>
    </dependency>
    <!--springcloud alibaba-->
    <dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-dependencies</artifactId>
    <version>2.2.1.RELEASE</version>
    <type>pom</type>
    <scope>import</scope>
    </dependency>
    </dependencies>
</dependencyManagement>


<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.rule.demo</groupId>
        <artifactId>nacos-spring-cloud-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <groupId>com.rule</groupId>
    <artifactId>nacos-service-consumer</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>nacos-service-consumer</name>
    <description>Project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <!--seata-->
        <dependency>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
            <version>1.4.0</version>
            <exclusions>
                <exclusion>
                    <groupId>com.alibaba</groupId>
                    <artifactId>druid</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>io.seata</groupId>
                    <artifactId>seata-spring-boot-starter</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <!--mysql-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.13</version>
        </dependency>
        <!--mybatis-plus-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus</artifactId>
            <version>3.4.2</version>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.0.5</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.3</version>
        </dependency>
        <!-- 引入Druid依赖，阿里巴巴所提供的数据源 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.1.10</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```



### 实现 provider 端

​	主要是三个文件  UserClient、MessageInfo、MessageController、MessageMapper

​	![image-20210408225202674](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408225202674.png)

1. UserClient 

   ```
   /**
    * 修改用户名接口
    */
   @FeignClient("nacos-service-consumer")
   public interface UserClient {
   
       @PostMapping("/user")
       void updateUserInfo(@RequestParam("id") String id,
                           @RequestParam("username") String username);
   
   }
   ```

2. MessageInfo

   ```
   @Getter
   @Setter
   @TableName(value = "t_message")
   @Builder
   public class MessageInfo {
   
       /**
        * id
        */
       @TableId(value = "id", type = IdType.AUTO)
       private Integer id;
   
       /**
        * 标题
        */
       private String title;
   
       /**
        * 请求内容
        */
       private String body;
   
       /**
        * 类型
        */
       private String type;
   
   }
   ```

3. MessageController

   ```
   /**
    * 生产者服务，测试seata
    */
   @RestController
   @RequestMapping("/provider")
   public class MessageController {
   
       @Resource
       private MessageMapper messageMapper;
   
       @Autowired
       private UserClient userClient;
   
       /**
        * 发送消息修改用户信息
        */
       @GetMapping("/send")
       // @GlobalTransactional  配置全局的事务方案
   //    @GlobalTransactional 
       public void sendMessage() {
           // 添加消息
           MessageInfo messageInfo = MessageInfo.builder().title("update user username")
                   .body("{\"id\":\"1\", \"username\":\"jarry\"}")
                   .type("send").build();
   
           messageMapper.insert(messageInfo);
           JSONObject body = JSON.parseObject(messageInfo.getBody());
           // 调用userClient 增加用户信息
           String username = body.getString("username") + System.currentTimeMillis();
           userClient.updateUserInfo(body.getString("id"), username);
           throw new RuntimeException("修改失败");
       }
   }
   ```

4. MessageMapper

   ```
   @Mapper
   public interface MessageMapper extends BaseMapper<MessageInfo> {
   }
   ```

### 实现 consumer 端

​	主要是三个文件  UserInfo、UserController、UserMapper

​	![image-20210408225234940](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408225234940.png)

 1. UserInfo

    ```
    @Data
    @TableName(value = "t_user")
    @Builder
    public class UserInfo {
    
        @TableId(value = "ID", type = IdType.AUTO)
        private Integer id;
    
        /**
         * 用户名
         */
        private String username;
    
        /**
         * 密码
         */
        private String password;
    
        /**
         * 权限
         */
        private String authorities;
    
    }
    ```

 2. UserController

    ```
    @RestController
    @RequestMapping("/user")
    public class UserController {
    
    
        @Resource
        private UserMapper userMapper;
    
        @PostMapping
        public void updateUserInfo(@RequestParam("id") String id,
                                   @RequestParam("username") String username) {
    
            // 增加一条用户信息
            UserInfo userInfo = UserInfo.builder().username(username).password("123456").authorities("123").build();
            userMapper.insert(userInfo);
        }
    }
    ```

3. UserMapper

   ```
   @Mapper
   public interface UserMapper extends BaseMapper<UserInfo> {
   }
   ```

1. 模拟正常的逻辑下，出现分布式事务

   1. 分别在两个客户端的控制层加上 `@Transactional`注解。模拟出现运行时异常时，让两者都不增加数据，结果却是 t_message没有增加，但是 t_user 增加一条用户 

      ```
          @GetMapping("/send")
          @Transactional
          public void sendMessage() {
              ``````
              ``````
              throw new RuntimeException("修改失败");
          }
          
              @PostMapping
          @Transactional
          public void updateUserInfo(@RequestParam("id") String id,
                                     @RequestParam("username") String username) {
              // 增加一条用户信息
              UserInfo userInfo = UserInfo.builder().username(username).password("123456").authorities("123").build();
              userMapper.insert(userInfo);
          }
      ```

   2. 模拟请求，查看结果

      ![image-20210408225834979](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408225834979.png)

      ![image-20210408230036386](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408230036386.png)

2. 模拟使用 Seata，解决分布式事务

   1. 只需要在 MessageController 上增加 `@GlobalTransactional` 注解。清空下两个表，再次模拟出现运行时异常时，结果时两者都没有增加数据。

      ```
      @GetMapping("/send")
          // @GlobalTransactional  配置全局的事务方案
          @GlobalTransactional
          public void sendMessage() {
      		````
      		````
      		throw new RuntimeException("修改失败");
          }
      ```

   2. 模拟请求，查看结果

      ![image-20210408230601241](https://gitee.com/rule-liu/pic/raw/master/img/image-20210408230601241.png)