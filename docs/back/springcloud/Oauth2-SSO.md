##  **Spring Cloud Gateway + Oauth2 + SSO搭建微服务的统一认证授权中心**

### **一、简介**

#### 1.1 Spring Cloud Gateway 网关服务

相比大家都应该知道。主要是统一我们的接口请求转发，将我们对其他服务的请求都通过网关进行转发。API网关封装了系统内部架构，为每个客户端提供一个定制的API。它可能还具有其它职责，如身份验证、监控、负载均衡、缓存、请求分片与管理、静态响应处理。API网关方式的核心要点是，所有的客户端和消费端都通过统一的网关接入微服务，在网关层处理所有的非业务功能。网关应当具备以下功能：

- 性能：API高可用，负载均衡，容错机制。
- 安全：权限身份认证、脱敏，流量清洗，后端签名（保证全链路可信调用）,黑名单（非法调用的限制）。
- 日志：日志记录（spainid,traceid）一旦涉及分布式，全链路跟踪必不可少。
- 缓存：数据缓存。
- 监控：记录请求响应数据，api耗时分析，性能监控。
- 限流：流量控制，错峰流控，可以定义多种限流规则。
- 灰度：线上灰度部署，可以减小风险。
- 路由：动态路由规则。

#### 1.2 Spring Cloud Gateway的特性

- 基于Spring Framework 5、Project Reactor和Spring Boot 2.0构建
- 能够在任意请求属性上匹配路由
- predicates（谓词） 和 filters（过滤器）是特定于路由的
- 集成了Hystrix断路器
- 集成了Spring Cloud DiscoveryClient
- 易于编写谓词和过滤器
- 请求速率限制
- 路径重写

![img](https://gitee.com/rule-liu/pic/raw/master/img/clipboard.png)

接下来介绍下Oauth2，这个主要是一种认证思路，可以去搜下阮一峰老师的Oauth2的基础知识，就应该明白了Oauth2 到底是什么。下面说下Oauth2 认证的几种方式，下面会使用授权码的方式进行认证。

#### 1.3 Oauth2 认证方式

**1. 授权码（authorization code）方式，指的是第三方应用先申请一个授权码，然后再用该码获取令牌 **。

```
https://b.com/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
```

大概流程就是A向B 发起上面的请求，然后地址跳转到 [CALLBACK_URL](https://b.com/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read)?code=XXX,然后跳转的页面url后会附带上授权码，然后A拿到授权码，向认证中心请求token（令牌），下面地址就是请求地址。最后得到access_token。拿到 access_token 作为请求的header去请求的url.

```
https://b.com/oauth/token?
 client_id=CLIENT_ID&
 client_secret=CLIENT_SECRET&
 grant_type=authorization_code&
 code=AUTHORIZATION_CODE&
 redirect_uri=CALLBACK_URL
```

**2. 隐藏式（implicit）**

**3. 密码式（password）**

**4. 凭证式（client credentials）**

### 二、项目搭建

接下来就是最重要的项目搭建环节了，首先总体的流程如下图所示

![权限流程图](https://gitee.com/rule-liu/pic/raw/master/img/%E6%9D%83%E9%99%90%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

文件目录如下：该项目是一个聚合项目，下面红色圈出的就是这个项目需要使用到的模块，其余模块不需要理会。

![image-20210405102631641](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405102631641.png)

#### 1. 搭建springcloud-demo 全局依赖

```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.rule.demo</groupId>
    <artifactId>nacos-spring-cloud-demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>springcloud-common</module>
        <module>nacos-service-provider</module>
        <module>nacos-service-consumer</module>
        <module>springcloud-gateway</module>
        <module>springcloud-auth</module>
        <module>oauth-client</module>
        <module>oauth-client2</module>
    </modules>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.2.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <properties>
        <java.version>1.8</java.version>
    </properties>
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
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.18</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

​                       

#### 2. 搭建springcloud-common，这里主要是做数据库连接的配置、redis、nacos配置信息的共用配置，减少后续项目使用相同配置的冗余

![image-20210405103221977](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405103221977.png)

**2.1 pom.xml**

```
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
   <artifactId>springcloud-common</artifactId>
   <version>0.0.1-SNAPSHOT</version>
   <name>springcloud-common</name>
   <description>公共组件包</description>
   <packaging>jar</packaging>
   <properties>
      <java.version>1.8</java.version>
   </properties>
   <dependencies>
      <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter</artifactId>
      </dependency>
      <dependency>
         <groupId>org.projectlombok</groupId>
         <artifactId>lombok</artifactId>
         <optional>true</optional>
      </dependency>
      <dependency>
         <groupId>mysql</groupId>
         <artifactId>mysql-connector-java</artifactId>
         <version>8.0.13</version>
      </dependency>
      <dependency>
         <groupId>org.springframework.cloud</groupId>
         <artifactId>spring-cloud-starter-oauth2</artifactId>
      </dependency>
      <dependency>
         <groupId>io.jsonwebtoken</groupId>
         <artifactId>jjwt</artifactId>
         <version>0.9.0</version>
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
      <!--redis-->
      <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-data-redis</artifactId>
      </dependency>
   </dependencies>
</project>
```

##### 2.2 配置全局的TokenStore

```
@Configuration
public class JwtTokenStoreConfig {

    /**
     * 秘钥串
     */
    private static final String SIGNING_KEY = "SigningKey";
    
    @Resource
    private UserMapper userMapper;

    @Bean
    public TokenStore jwtTokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }

    // JWT
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter accessTokenConverter = new JwtAccessTokenConverter() {
            /***
             * 重写增强token方法,用于自定义一些token总需要封装的信息
             */
            @Override
            public OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {
                String userName = authentication.getUserAuthentication().getName();
                // 数据库中查询用户信息
                QueryWrapper<UserInfo> wrapper = new QueryWrapper<>();
                wrapper.eq("username", userName);
                UserInfo userInfo = userMapper.selectOne(wrapper);
                // 得到用户名，去处理数据库可以拿到当前用户的信息和角色信息（需要传递到服务中用到的信息）
                final Map<String, Object> additionalInformation = new HashMap<>();
                additionalInformation.put("userInfo", JSON.toJSONString(userInfo));
                ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(additionalInformation);
                return super.enhance(accessToken, authentication);
            }
        };
        // 测试用,资源服务使用相同的字符达到一个对称加密的效果,生产时候使用RSA非对称加密方式
        accessTokenConverter.setSigningKey(SIGNING_KEY);
        return accessTokenConverter;
    }
}
```

##### **2.3 配置全局的 PasswordEncoder**

```
@Component
public class MyPasswordEncoder extends BCryptPasswordEncoder {
}
```

**2.4 登录的用户信息UserInfo**

```
@Data
@TableName(value = "t_user")
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

**2.5 mapper文件**

```
@Mapper
public interface UserMapper extends BaseMapper<UserInfo> {
}
```

**2.6 application-common.yml**

```
spring:
  cloud:
    nacos:
      config:
        shared-configs:
          - data-id: common.yaml
            refresh: true
  redis:
    host: ${redis.host}
    port: ${redis.port}
    database: ${redis.database}
    password: ${redis.password}
    # 配置数据源
  datasource:
    url: ${mysql.datasource.url}
    username: ${mysql.datasource.username}
    password: ${mysql.datasource.password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    druid:
      filters: stat
      maxActive: 20
      initialSize: 1
      maxWait: 60000
      minIdle: 1
  # mybatis-plus相关配置
  mybatis-plus:
    # xml扫描，多个目录用逗号或者分号分隔（告诉 Mapper 所对应的 XML 文件位置）
    mapper-locations: classpath:**/*Mapper.xml
    # 以下配置均有默认值,可以不设置
    global-config:
      #主键类型  0:"数据库ID自增", 1:"用户输入ID",2:"全局唯一ID (数字类型唯一ID)", 3:"全局唯一ID UUID";
      id-type: 0
      #字段策略 0:"忽略判断",1:"非 NULL 判断"),2:"非空判断"
      field-strategy: 2
      #驼峰下划线转换
      db-column-underline: true
      #刷新mapper 调试神器
      refresh-mapper: false
    configuration:
      # 是否开启自动驼峰命名规则映射:从数据库列名到Java属性驼峰命名的类似映射
      map-underscore-to-camel-case: true
      cache-enabled: false
      jdbc-type-for-null: 'null'
```

**2.7 bootstrap.properties：配置统一的nacos注册、配置中心地址**

```
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

**2.8 用于网关转发请求后路径失败问题，配置全局cookie：NacosConfig**

```
@Configuration
public class NacosConfig {

    /**
     * 用于改变程序自动获取的本机ip
     */
    @Bean
    @Primary
    public NacosDiscoveryProperties nacosProperties() {
        NacosDiscoveryProperties nacosDiscoveryProperties = new NacosDiscoveryProperties();
        nacosDiscoveryProperties.setIp("localhost");
        return nacosDiscoveryProperties;
    }
}
```



#### 3. 搭建springcloud-auth：项目结构图如下

![image-20210405103647036](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405103647036.png)

**3.1 依赖文件 pom.xml**

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.rule.demo</groupId>
        <artifactId>nacos-spring-cloud-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <artifactId>springcloud-auth</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springcloud-auth</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.rule</groupId>
            <artifactId>springcloud-common</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
    </dependencies>
</project>
```

**3.2 搭建授权中心 AuthorizationServerConfiguration**

```
/**
 * 授权服务中心
 */
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    RedisConnectionFactory redisConnectionFactory;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ClientDetailsService clientDetailsService;

    @Autowired
    @Qualifier("jwtTokenStore")
    private TokenStore jwtTokenStore;

    @Autowired
    @Qualifier("accessTokenConverter")
    private JwtAccessTokenConverter jwtAccessTokenConverter;

    @Autowired
    @Qualifier("userDetailsService")
    private UserDetailsService userDetailsService;

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.jdbc(dataSource).clients(clientDetailsService);
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
        // userDetailsService 使用refresh_token 时需要
        endpoints.userDetailsService(userDetailsService)
                .tokenStore(jwtTokenStore)
                .accessTokenConverter(jwtAccessTokenConverter)
                .authenticationManager(authenticationManager);
    }

    /**
     * 获取密钥需要身份验证，使用单点登陆时必须配置
     *
     * @param security security
     */
    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) {
        // 使用单点登陆时必须配置
        security.tokenKeyAccess("isAuthenticated()");
        // 不适用单点
//        security
//                .tokenKeyAccess("permitAll()")
//                .checkTokenAccess("permitAll()")
//                .allowFormAuthenticationForClients();
    }

    @Bean
    public ClientDetailsService clientDetails() {
        return new JdbcClientDetailsService(dataSource);
    }

}
```

**3.3 自定义用户登录校验类 DomainUserDetailsService**

```
@Slf4j
@Service("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService {

    @Resource
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 数据库中查询用户信息
        QueryWrapper<UserInfo> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        UserInfo user = userMapper.selectOne(wrapper);
        if (user == null) {
            throw new UsernameNotFoundException("用户" + username + "不存在");
        }
        return new User(user.getUsername(), user.getPassword(),
                AuthorityUtils.commaSeparatedStringToAuthorityList(user.getAuthorities()));
    }
}
```

**3.4 资源配置中心 ResourceServerConfig**

```
/**
 * 资源服务器配置
 */
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .anyRequest()
                .authenticated()
                .and()
                .requestMatchers()
                .antMatchers("/user/**");
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId("dev");
    }
}
```

**3.5 springsecurity 配置类，主要是对路径的放行**

```
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()// 禁用跨站攻击
                .authorizeRequests()
                .antMatchers("/oauth/**", "/login/**",  "/login.html",
                        "/success.html", "/fail.html")
                .permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .formLogin()
                .loginPage("/login.html")
                .loginProcessingUrl("/demo-login")
                .failureForwardUrl("/login/fail")
                .permitAll();
    }

    @Bean(name = BeanIds.AUTHENTICATION_MANAGER)
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
```

**3.6 配置文件 bootstrap.yml, applicaiton.yml 主要配置端口就不展示了**

```
spring:
  application:
    name: springcloud-auth
  cloud:
    nacos:
      config:
        shared-configs:
          - data-id: common.yaml
            refresh: true
## 引入application-common.yml
  profiles:
    include: common
```

#### 4. 搭建oauth-client

![image-20210405103852004](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405103852004.png)

**4.1 依赖文件 pom.xml**

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.rule.demo</groupId>
        <artifactId>nacos-spring-cloud-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <artifactId>springcloud-auth</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springcloud-auth</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.rule</groupId>
            <artifactId>springcloud-common</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
    </dependencies>
</project>
```

**4.2 权限过滤中心：AuthenticationFilter，这块可以提出来放到common模块中作为公共的权限过滤**

```
@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader("json-token");
        if (StringUtils.isNotBlank(token)) {
            String json = new String(Base64Utils.decodeFromUrlSafeString(token));
            JSONObject jsonObject = JSON.parseObject(json);
            //获取用户身份信息、权限信息
            String principal = jsonObject.getString("principal");
            JSONArray tempJsonArray = jsonObject.getJSONArray("authorities");
            String[] authorities = tempJsonArray.toArray(new String[0]);
            //身份信息、权限信息填充到用户身份token对象中
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(principal, null,
                    AuthorityUtils.createAuthorityList(authorities));
            //创建details
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            //将authenticationToken填充到安全上下文
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }
        filterChain.doFilter(request, response);
    }
}
```

**4.3 资源认证中心：ResourceServerConfig**

```
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {


    @Autowired
    @Qualifier("jwtTokenStore")
    private TokenStore tokenStore;

    /**
     * 资源ID
     */
    private static final String RESOURCE_ID = "dev";


    /**
     * 资源配置
     */
    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId(RESOURCE_ID)
                .tokenStore(tokenStore)
                .stateless(true);
    }

    /**
     * 请求配置
     */
    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .anyRequest()
                .authenticated()
                .and()
                .requestMatchers()
                .antMatchers("/user/**");
    }
}
```

**4.4 测试类 UserController**

```
@RequestMapping("/user")
@RestController
public class UserController {

    @RequestMapping("/getCurrentUser")
    public Object getCurrentUser(Authentication authentication) {
        return authentication;
    }
}
```

#### 5. springcloud Gateway：作为请求的转发。

![image-20210405104006613](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104006613.png)



**5.1 pom.xml 文件**

```
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
    <artifactId>springcloud-gateway</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springcloud-gateway</name>
    <description>Project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>com.rule</groupId>
            <artifactId>springcloud-common</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-web</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-web</artifactId>
                </exclusion>
            </exclusions>
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

**5.2 网关跨域配置：GatewayCorsConfiguration**

```
@Configuration
public class GatewayCorsConfiguration {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsWebFilter(source);
    }
}
```

**5.3 网关过滤请求类：GatewayFilterConfig**

```
@Component
@Slf4j
@Order(-1)
public class GatewayFilterConfig implements GlobalFilter {

    @Autowired
    @Qualifier("jwtTokenStore")
    private TokenStore tokenStore;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestUrl = exchange.getRequest().getPath().value();
        AntPathMatcher pathMatcher = new AntPathMatcher();
        //1 认证服务所有放行
        if (pathMatcher.match("/oauth/**", requestUrl)) {
            return chain.filter(exchange);
        }
        //2 检查token是否存在
        String token = getToken(exchange);
        if (StringUtils.isBlank(token)) {
            return noTokenMono(exchange);
        }
        //3 判断是否是有效的token
        OAuth2AccessToken oAuth2AccessToken;
        try {
            oAuth2AccessToken = tokenStore.readAccessToken(token);
            Map<String, Object> additionalInformation = oAuth2AccessToken.getAdditionalInformation();
            //取出用户身份信息
            String principal = additionalInformation.get("user_name").toString();
            //获取用户权限
            List<String> authorities = (List<String>) additionalInformation.get("authorities");
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("principal", principal);
            jsonObject.put("authorities", authorities);
            //给header里面添加值
            String base64 = Base64Utils.encodeToUrlSafeString(jsonObject.toJSONString().getBytes());
            ServerHttpRequest tokenRequest = exchange.getRequest().mutate().header("json-token", base64).build();
            ServerWebExchange build = exchange.mutate().request(tokenRequest).build();
            return chain.filter(build);
        } catch (InvalidTokenException e) {
            log.info("无效的token: {}", token);
            return invalidTokenMono(exchange);
        }
    }


    /**
     * 获取token
     */
    private String getToken(ServerWebExchange exchange) {
        String tokenStr = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (StringUtils.isBlank(tokenStr)) {
            return null;
        }
        return StringUtils.substring(tokenStr, "Bearer ".length());
    }


    /**
     * 无效的token
     */
    private Mono<Void> invalidTokenMono(ServerWebExchange exchange) {
        JSONObject json = new JSONObject();
        json.put("status", HttpStatus.UNAUTHORIZED.value());
        json.put("data", "无效的token");
        return buildReturnMono(json, exchange);
    }

    private Mono<Void> noTokenMono(ServerWebExchange exchange) {
        JSONObject json = new JSONObject();
        json.put("status", HttpStatus.UNAUTHORIZED.value());
        json.put("data", "没有token");
        return buildReturnMono(json, exchange);
    }


    private Mono<Void> buildReturnMono(JSONObject json, ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        byte[] bits = json.toJSONString().getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bits);
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        //指定编码，否则在浏览器中会中文乱码
        response.getHeaders().add("Content-Type", "text/plain;charset=UTF-8");
        return response.writeWith(Mono.just(buffer));
    }
```

**5.4 Spring Security 配置 Security Config** 

```
@EnableWebFluxSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain webFluxSecurityFilterChain(ServerHttpSecurity http) {
        return http.authorizeExchange()
                .pathMatchers("/**").permitAll()
                .anyExchange().authenticated()
                .and().csrf().disable().build();
    }
}
```

**5.5 bootstrap.yml：服务的转发地址等配置信息**

```
spring:
  application:
    name: gateway
  profiles:
    include: common
  cloud:
    nacos:
      config:
        shared-configs:
          - data-id: common.yaml
            refresh: true
    gateway:
      discovery:
        locator:
          enabled: true
      routes:
      - id: provider-router
        uri: lb://nacos-service-provider
        predicates:
          - Path=/config/**
      - id: oauth-client
        uri: lb://oauth-client
        predicates:
          - Path=/oauth-client/**
      - id: springcloud-auth
        uri: lb://springcloud-auth
        predicates:
          - Path=/auth/**
        ### StripPrefix参数表示在将请求发送到下游之前从请求中剥离的路径个数。
        filters:
          - StripPrefix=1
```

### 三、测试

上述的项目已经搭建好了，接下来就来测试一下。主要的流程是：认证中心获取授权码-》获取token-》获取资源，上述的一系列操作都是通过网关进行转发。启动项目

![image-20210405104316640](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104316640.png)

![image-20210405104330682](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104330682.png)

#### 1. 获取授权码

http://localhost:9000/oauth/authorize?response_type=code&client_id=oauth-client&redirect_uri=http://localhost:9001/login，然后输入账号密码获取到code。

![image-20210405104426351](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104426351.png)

#### 2. 获取token

![image-20210405104445238](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104445238.png)

![image-20210405104458420](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104458420.png)

#### 3. 拿到token去访问，oauth-client服务，得到结果

![image-20210405104541323](https://gitee.com/rule-liu/pic/raw/master/img/image-20210405104541323.png)