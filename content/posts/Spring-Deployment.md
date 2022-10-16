+++
title = "Spring Deployment from xml to annotation, from manually to jenkins"
description = ""
date = "2020-01-19"
aliases = ["springmvc-deployment"]
tags = ["spring", "mvc", "deployment", "jenkins"]
author = "Luke Yao"
draft = false
+++

## Convention

从最初的 J2EE (1999 - 2006) 到 JavaEE (2006 - 2019), 再到 Jakarta (2019 - so far), 其实本质上还是一个东西, 由于历史原因出现了若干名称, 是 Oracle 最初为了区分服务和平台而创建的 Java Platform, Enterprise Edition, 相对于 Standard Edition, 加入了以 javax 为 prefix domain 的 jar 包 (for web development). 所以总结如下:

```text
  J2EE   = JavaEE = JEE = Jakarta

                         ┌─ javax.servlet
  JavaEE = JavaSE + jar ─┼─ javax.websocket
                         └─ ...

```

其中 Servlet 是 JavaEE 平台提出并逐渐成为业内主流实际的 Java Web Development Standard, 但是 Servlet 只是一个标准, 并没有提供完整的实现, 要运行 Servlet 还需要类似 Python WSGI 平台 的 Servlet Container.

JavaEE 本身没有提供 Servlet Container, 比较常用支持 *Servlet Container* 的 Server 软件有 Apache Tomcat, Glassfish, JBoss, Jetty 等等.

EJB 全称 *Enterprise JavaBean*, 和 *Servlet* 一样, 也是 JavaEE 当中的一个组件, 面向更加复杂的企业业务开发. 对于 Web 开发来说, EJB 不是必须的. 和 Servlet 类似, 运行 EJB 也需要专门的 *EJB Container*. 并不是所有的 Server 软件都支持 EJB. 例如, `Apache Tomcat` 不支持 EJB, 而 `JBoss` 提供了对 EJB 的支持.

*Spring* 某种程度上可以认为是 EJB 的替代品. *Spring* 不需要完整的 JavaEE 内容, 仅仅依赖了最基础的 Servlet, 也不需要 EJB Container, 只用普通的 Servlet Container 就可以运行. 在 Servlet 之上 Spring 提供了诸多方便好用的工具, 极大地降低了 Java Web 开发入门门槛.

*Spring* 和 JavaEE 不是一个层面上的东西. Spring 仅依赖了 JavaEE 的 API 标准, 最新版的 *Spring* 甚至进一步隔绝了 JavaEE 的 API. 开发者可以完全不关心 Servlet 或者 JavaEE 等概念, 也可以进行 Java Web 开发. 同时 *Spring* 也不是唯一的 Java Web 框架, 其竞争对手有 *Structs* 等.

## Deploy Spring MVC on Tomcat manually

下面是实验手动部署 Spring MVC 的一个过程, 使用 mvn 进行项目的创建: 

mvn 的 dependencies 有:

```xml
 <dependency>
     <groupId>org.springframework</groupId>
     <artifactId>spring-webmvc</artifactId>
     <version>4.3.8.RELEASE</version>
 </dependency>

 <dependency>
     <groupId>com.fasterxml.jackson.core</groupId>
     <artifactId>jackson-databind</artifactId>
     <version>2.7.3</version>
 </dependency>

 <dependency>
     <groupId>com.github.javafaker</groupId>
     <artifactId>javafaker</artifactId>
     <version>1.0.2</version>
 </dependency>
```

其中除了主要的 springframework, 还有用于序列化支持 jackson core, 提供假数据的 javafaker. 而项目的大体结构一开始如下:

```shell
tree -L 2 .
.
├── pom.xml
├── WEB-INF
│   ├── classes
│   └── lib
└── src
    ├── main
    └── test
```
- classes 目录用于存放编译结果.

- lib 目录用于存放依赖, 主要是 springframework, jackson, javafaker.

依赖的话, 如果懒得四处下载, 可以从 m2 目录拷贝, 这里只是为了一个体验手动部署的过程, 才这么麻烦地拷贝依赖.

### Controller and Model in use

Book:

```java
package com.luke.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.SneakyThrows;

public class Book {
    private String title;
    private String genre;
    private String author;
    private String publisher;

    @SneakyThrows
    @Override
    public String toString() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        return mapper.writeValueAsString(this);
    }
    
    // some setter and getter method
}
```
FakeBook:

```java
package com.luke.model;

import com.github.javafaker.Faker;

public class FakeBook {
    public static Faker fake = new Faker();

    public static Book randomBook() {
        return new Book()
                .setTitle(fake.book().title())
                .setGenre(fake.book().genre())
                .setAuthor(fake.book().author())
                .setPublisher(fake.book().publisher());
    }

}
```
Conroller:

```java
package com.luke.controller;


import com.luke.model.FakeBook;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/book")
public class BookController {
    @RequestMapping(method = RequestMethod.GET)
    public @ResponseBody String hello() {
        return FakeBook.randomBook().toString();
    }
}
```

### Spring XML-based Config

接着在 WEB-INF/ 下创建一个配置 Servlet 外部路由的 web.xml, 内容如下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4" xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee
                               http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <servlet>
        <servlet-name>fake-world</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>fake-world</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```
Spring 为了尽可能屏蔽 Servlet 的细节, 在 Servlet 处理外部到 Dispatcher 的路由后, 对内使用 Dispatcher 管理自己的路由.

还有两点需注意:

1. 加入的 `load-on-startup` 参数, 作用：告知 Container 在启动的时候就加载这个 Servlet (而非收到请求时才加载)

2. 使用了 `/*` 的 wildcard URL, 作用：符合 `/*` 的 web 路径 (即所有的请求) 都将由 DispatcherServlet 处理. 在 Tomcat 部署环境中, 这部分代表了 DispatcherServlet 的 Servlet Path, 而应用本身在 webapp 下的目录相当于 Context Path. 一个正常 URL 构成: http://localhost:8080/context-path/servlet-path/filename

为了让 DispatchServlet 找到自行编写的 Controller, Spring 提供了实用 xml 的配置方法:

在 `WEB-INF` 文件夹下, 也就是 web.xml 隔壁, 创建一个 fake-world-servlet.xml (注意命名 -servlet.xml):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="com.luke"/>

</beans>
```
其中 context:component-scan 自动扫描设定的包, 使用 Spring IOC 装配 Controller, 最后是部署, 提供一下脚本:

```shell
#!/bin/zsh

TOMCAT_WEBAPPS="/opt/homebrew/Cellar/tomcat@8/8.5.82/libexec/webapps"
APP_URL="fake-world"
END_POINT=$1

rm -rf WEB-INF/classes && echo 'delete old compiled thing'

mvn compile

cp -r target/classes WEB-INF/classes

rm -rf ${TOMCAT_WEBAPPS}/${APP_URL}/

mkdir ${TOMCAT_WEBAPPS}/${APP_URL}/

cp -r WEB-INF ${TOMCAT_WEBAPPS}/${APP_URL}/

echo "compiling and deploying"

mvn clean

brew services restart tomcat@8

echo "deployed"
```

测试一下:

```shell
curl -s http://localhost:8080/fake-world/book | jq
{
  "title": "Shall not Perish",
  "genre": "Fanfiction",
  "author": "Sparkle Bechtelar",
  "publisher": "Kogan Page"
}
```
### Spring Annotation-based Config

Spring 本身逐渐从 XML 转向了基于 Annotation 的配置, 与之类似的, Servlet API 从 3.0 开始也支持了基于 Annotation 的配置.

在 Servlet 3 中, 可以继承 `ServletContainerInitializer` 来实现替代 `web.xml` 的作用. Servlet 3 要求在 deploy 目录中加入 `META-INF/services/javax.servlet.ServletContainerInitializer` 文件, 来指示 `ServletContainerInitializer` 的实现者, 用于 Servlet 的初始化.

取得的效果就是在 Servlet 3 中可以用 `@WebServlet` 来配置路由, 进一步实现了 config 和 source 的集中处理.

SpringMVC 也做了这件事情, 在 `spring-web-4.3.9.RELEASE` 这个 jar 里可以找到 `javax.servlet.ServletContainerInitializer` 这个文件, 里面的内容是: `org.springframework.web.SpringServletContainerInitializer` 

同时 SpringMVC 暴露名为 `WebApplicationInitializer` 的接口, 通过这个接口可以进行类似 `web.xml` 的配置.

这一层封装, 是把 Servlet API 和 Spring API 隔离开. 下面进行去掉 web.xml 配置的操作:

创建一个新类 `HelloWebApplicationInitializer`:

```java
package com.luke;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

public class WebAppInitializr 
    implements WebApplicationInitializer {
    
    @Override
    public void onStartup(ServletContext servletContext) 
            throws ServletException {
        ServletRegistration.Dynamic registration =
               servletContext.addServlet("fake-world", 
                       new DispatcherServlet());
        
        registration.setLoadOnStartup(1);
        registration.addMapping("/");
    }
}
```
注意配置的内容, 实际上和之前用过的 `web.xml` 是可以对应的:

```xml
<servlet>
    <servlet-name>fake-world</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>fake-world</servlet-name>
    <url-pattern>/*</url-pattern>
</servlet-mapping>
```

接着删除 web.xml, 再次运行 deploy.sh, 并测试如下:

```shell
curl -s http://localhost:8080/fake-world/book | jq
{
  "title": "Specimen Days",
  "genre": "Fiction in verse",
  "author": "Gretchen Turner IV",
  "publisher": "Sams Publishing"
}
```
可以看到自行定义继承 `WebApplicationInitializer` 的 `WebAppInitializr` 起到了和 web.xml 一样的作用.

接下去是去掉 `fake-world`, 其实就是指导 `registration` 怎么去加载配置, 默认是使用 `ClassPathXmlApplicationContext` 去加载在 App Directory 下的 -servlet.xml 文件.

先编写一个配置类

```java
package com.luke;

import com.luke.controller.BookController;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebAppConfig {
    @Bean
    public Object bookController() {
        return new BookController();
    }
}
```
再使用 registration 加载:

```java
package com.luke;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

public class WebAppInitializr
    implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext)
            throws ServletException {

        AnnotationConfigWebApplicationContext subContext =
                new AnnotationConfigWebApplicationContext();
        subContext.setConfigLocation("com.luke.WebAppConfig");

        ServletRegistration.Dynamic registration =
               servletContext.addServlet("fake-world",
                       new DispatcherServlet(subContext));

        registration.setLoadOnStartup(1);
        registration.addMapping("/");
    }
}
```
上面定义为 subContext 其实也只是想声明一种顺序.

现在去掉 `fake-world-servlet.xml`, 并运行 deploy.sh. 测试结果如下:

```shell
curl -s http://localhost:8080/fake-world/book | jq
{
  "title": "A Time of Gifts",
  "genre": "Fairy tale",
  "author": "Josie Kunze",
  "publisher": "Hodder Headline"
}
```

为了进一步简化 Java 配置的过程, Spring 还提供了一个名为 `AbstractAnnotationConfigDispatcherServletInitializer` 的类. 修改的 `WebApplicationInitializr`:

```java
public class WebApplicationInitializr
    extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class [] {
        };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class [] {WebAppConfig.class};
    }

    @Override
    protected String [] getServletMappings() {
        return new String [] {"/*"};
    }
}
```

可以看到这种方法更加直接和明了. 

注意上面有一个 `getRootConfigClasses` 返回了空数组. `getServletConfigClasses` 用于创建当前 DispatcherServlet 的 WebApplicationContext, 在此基础上, Spring 还允许若干 DispatcherServlet 共享一个 Root WebApplicationContext. Root WebApplicationContext 中可以配置跨 Servlet 共享的业务逻辑等, `getRootConfigClasses` 就是用来提供创建 Root WebApplicationContext 的.

### EnableWebMvc and RestController

在前面例子中是一直用 jackson 手动 serlialize 的, 这里开始用 @EnableWebMvc 和 @RestController 来简化操作, 更改 WebAppConfig 如下:

```java
package com.luke;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@ComponentScan("com.luke")
@EnableWebMvc
public class WebAppConfig {
}
```

`@EnableWebMvc` 是 Spring MVC 新版本所推荐的用法, 它做很多配置工作. `@EnableWebMvc` 具体做的事情可以参考 [Spring 官方文档](https://docs.spring.io/spring/docs/4.2.1.RELEASE/javadoc-api/org/springframework/web/servlet/config/annotation/WebMvcConfigurationSupport.html). 这里需要知道的是, `@EnableWebMvc` 会配置好 JSON 有关的响应 Handler. 如果没有, 是不能返回 JSON 响应的.

更改 BookController 如下:

```java
package com.luke.controller;


import com.luke.model.Book;
import com.luke.model.FakeBook;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/book")
public class BookController {
    @RequestMapping(method = RequestMethod.GET)
    public Book hello() {
        return FakeBook.randomBook();
    }
}
```

`@RestController` 实际上就是在 `@Controller` 的基础上, 给所有的函数返回值增加了 `@ResponseBody`. 因此在函数里不需要再指明 `@ResponseBody`, 可以直接将 Java 对象 (如 Person)返回, 简化了代码的编写.

`sh deploy.sh` -> `curl -s http://localhost:8080/fake-world/book | jq` :

```json
{
  "title": "The Waste Land",
  "genre": "Folklore",
  "author": "Boris Rempel",
  "publisher": "Da Capo Press"
}
```

至此, 手动部署 Spring MVC 的过程到这里就结速, 下面来看看, 打包成 war 包的过程.


## Deploy Spring MVC war on Tomcat manually

在 pom file 中将 packaging 改为 war, 然后添加如下设置

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <inherited>true</inherited>
            <artifactId>maven-war-plugin</artifactId>
            <version>${war.version}</version>
            <configuration>
                <failOnMissingWebXml>false</failOnMissingWebXml>
            </configuration>
        </plugin>
    </plugins>
    <finalName>${artifactId}</finalName>
</build>
```
更改 deploy.sh 为如下内容:

```shell
#!/bin/zsh

TOMCAT_WEBAPPS="/opt/homebrew/Cellar/tomcat@8/8.5.82/libexec/webapps"
APP_URL="fake-world"
# END_POINT=$1

mvn war:war

brew services stop tomcat@8

rm -rf ${TOMCAT_WEBAPPS}/${APP_URL}*

mv target/${APP_URL}.war ${TOMCAT_WEBAPPS}/

brew services start tomcat@8
```


## Deploy Spring MVC war on Tomcat by Maven plugin

1. 在 TOMCAT_HOME/conf/tomcat-users.xml 添加 tomcat-user:

```xml
<user username="war-deployer" password="maven-tomcat-plugin" 
                    roles="manager-gui, manager-script, manager-jmx" />
```
其中 role: manager-script 为了后面 Jenkins 保留的.

2. 在 maven 的 settings.xml 中添加 server:

```xml
<server>
    <id>maven-tomcat-war-deployment-server</id>
    <username>war-deployer</username>
    <password>maven-tomcat-plugin</password>
</server>
```
3. 最后在 pom 中添加 plugin:

```xml
<plugin>
    <groupId>org.apache.tomcat.maven</groupId>
    <artifactId>tomcat7-maven-plugin</artifactId>
    <version>2.2</version>
    <configuration>
        <url>http://localhost:8080/manager/text</url>
        <path>/fake-world</path>
        <server>maven-tomcat-deployment-server</server>
        <username>war-deployer</username>
        <password>maven-tomcat-plugin</password>
    </configuration>
</plugin>
```
4. 运行 `mvn tomcat7:deploy`.

5. `curl -s http://localhost:8080/fake-world/book | jq`

6. 重新部署运行 `mvn tomcat7:redeploy`


## Deploy Spring MVC war on Tomcat by Jenkins

### Installation

```shell
brew install jenkins-lts
```
### Config the service

编辑 homebrew.mxcl.jenkins-lts.plist 如下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>homebrew.mxcl.jenkins-lts</string>
	<key>LimitLoadToSessionType</key>
	<array>
		<string>Aqua</string>
		<string>Background</string>
		<string>LoginWindow</string>
		<string>StandardIO</string>
		<string>System</string>
	</array>
	<key>ProgramArguments</key>
	<array>
		<string>/Users/luke/Library/Java/JavaVirtualMachines/azul-17.0.4.1/Contents/Home/bin/java</string>
		<string>-Dmail.smtp.starttls.enable=true</string>
		<string>-Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true</string>
		<string>-jar</string>
		<string>/opt/homebrew/opt/jenkins-lts/libexec/jenkins.war</string>
		<string>--httpListenAddress=localhost</string>
		<string>--httpPort=8090</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
```
- `-Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true` 使 Jenkins 可以使用本地的 Git Repo.

- `open http://localhost:8090`.

### Jenkins Plugins Installation

- Pipeline

- Maven

- Deploy to Container

- Git info

安装好上述的四方面的 plugins.

### New Item

在 dashboard 中 new item, 或者 create new job, 开始配置:

1. General > Description: Maven War against Tomcat;

2. Source Code Management > Git > 

   Repositories >
   
       - Repository URL: file:///Users/luke/IdeaProjects/fake-world
       
       - Credentials: None
   
   Branches to Build:  */master

3. Build Triggers: 先跳过, 按需配置即可

4. Build Environment: 先跳过, 按需配置即可

5. Pre Steps: 先跳过, 按需配置即可

6. Build >
   
   Root POM: default
   
   Goals and options: clean install
   
7. Post Steps: Run only if build succeeds   

8. Build Settings: 先跳过, 按需配置即可

9. Post-build Actions:

   - Add post-build action > Deploy war/ear to a container
   
   - WAR/EAR files: `**/*.war`
   
   - Context path: fake-world
   
   - Container > Tomcat8.x remote
   
     Credentials from tomcat-users.xml
     
     Tomcat URL: http://localhost:8080
     
     Manager context path: defalut as /manager

10. Apply and Save

最后可以 `brew services stop tomcat@8`, 并删除相关的 fake-world 目录和 war 包. 在 Jenkins dashboard 中点击 Build now.

再测试部署结果.
