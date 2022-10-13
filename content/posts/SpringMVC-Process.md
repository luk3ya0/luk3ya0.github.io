+++
title = "Spring MVC Process Overview"
description = ""
date = "2020-03-01"
aliases = ["springmvc-process"]
tags = ["spring", "mvc"]
author = "Luke Yao"
draft = true
+++
![](images/spring/10-0.png)


上图是 Images/Spring 与 Servlet 交互的大体概览, 但是 The devil is in the details. DispatcherServlet 分发了请求之后的细节满满, 下面尝试深入 Images/Spring MVC 的源码, 理解一下 Images/Spring MVC 流程原理.

## Spring MVC Process

Images/Spring MVC 框架整体的请求流程如图所示, 该图显示了用户从请求到响应的完整流程.

(1) Client request 请求, 该请求被 DispatcherServlet 处理.

(2) DispatcherServlet 请求 HandlerMapping 查找 Handler.

(3) HandlerMapping 根据配置查找相关的 HandlerExecutionChain, 返回给 DispatcherServlet.

(4) DispatcherServlet 请求 HandlerAdapter 执行相应的 Handler (或称为 Controller).

(5) HandlerAdapter 执行 Handler.

(6) Handler 执行完毕后会返回 ModelAndView 给 HandlerAdapter.

![Images/Spring MVC 框架整体的请求流程](images/spring/10-1.png)

(7) HandlerAdapter 接收到 Handler 返回的 ModelAndView 后, 将其返回给 DispatcherServlet.

(8) DispatcherServlet 接收到 ModelAndView 对象后, 请求 ViewResolver 对视图进行解析.

(9) ViewResolver 根据 View 信息匹配相应的视图结果, 返回给 DispatcherServlet.

(10) DispatcherServlet 收到 View 后, 对视图进行渲染, 将 Model 中的模型数据填充到 View 视图中的 request 域, 生成最终的视图.

(11) DispatcherServlet 返回请求结果给 Client.

HandlerAdapter 执行 Handler(或称为 Controller) 的过程中, Images/Spring 还做了一些额外的工作, 具体如图所示.

HttpMessageConverter

: 将请求信息, 比如: JSON, XML 等数据转换成一个对象, 并将对象转换为指定的响应信息.

Data Coversion

: 对请求的信息进行转换, 比如, String 转换为 Integerx Double 等.

Data Format

: 对请求消息进行数据格式化, 比如字符串转换为格式化数据或者格式化日期等.

Data Validation
: 验证请求数据的有效性, 并将验证的结果存储到 BindingResult 或 Error 中.

![数据转换, 格式化, 校验](images/spring/10-2.png)

以上就是 Sring MVC 请求到响应的整个工作流程, 中间使用到的组件有 DispatcherServlet, HandlerMapping, HandlerAdapter, Handler or Controller, ViewResolver 和 View 等.

## DispatcherServlet

DispatcherServlet 的作用就是接受用户请求, 然后给用户响应结果. 它的作用相当于一个转发器或中央处理器, 控制整个流程的执行, 对各个组件进行统一调度, 以降低组件之间的耦合性, 有利于组件之间的扩展.

DispatcherServlet 部分的源码如下所示:

``` java
public class DispatcherServlet extends FrameworkServlet {
    // static variable ...
    //
    @Nullable
    private LocaleResolver localeResolver;
    @Nullable
    private ThemeResolver themeResolver;
    @Nullable
    private List<HandlerMapping> handlerMappings;
    @Nullable
    private List<HandlerAdapter> handlerAdapters;
    @Nullable
    private List<HandlerExceptionResolver> handlerExceptionResolvers;
    @Nullable
    private RequestToViewNameTranslator viewNameTranslator;
    @Nullable
    private FlashMapManager flashMapManager;
    @Nullable
    private List<ViewResolver> viewResolvers;


    protected void initStrategies(ApplicationContext context) {
        this.initMultipartResolver(context);
        this.initLocaleResolver(context);
        this.initThemeResolver(context);
        this.initHandlerMappings(context);
        this.initHandlerAdapters(context);
        this.initHandlerExceptionResolvers(context);
        this.initRequestToViewNameTranslator(context);
        this.initViewResolvers(context);
        this.initFlashMapManager(context);
    }

    // other methods ...
}
```

DispatcherServlet 类的类继承结构如图所示.

![DispatcherServlet 的类结构](images/spring/10-3.png)

由图可知, DispatcherServlet 最上层的父类是 Servlet 类, 也就是说 DispatcherServlet 也是一个 Servlet, 且包含有 deGet() 和 doPost() 方法. initStrategies 方法在 WebApplicationContext 初始化后自动执行, 自动扫描上下文的 Bean, 根据名称或者类型匹配的机制查找自定义的组件, 如果没有找到, 会装配 Images/Spring 的默认组件. Images/Spring 的默认组件在 org.images/springframework.web.servlet 路径下的 DispatcherServlet.properties 配置文件中配置. DispatcherServlet.properties 的具体代码如下:

``` conf
# Default implementation classes for DispatcherServlet's strategy interfaces.
# Used as fallback when no matching beans are found in the DispatcherServlet context.
# Not meant to be customized by application developers.

org.images/springframework.web.servlet.LocaleResolver=org.images/springframework.web.servlet.i18n.AcceptHeaderLocaleResolver

org.images/springframework.web.servlet.ThemeResolver=org.images/springframework.web.servlet.theme.FixedThemeResolver

org.images/springframework.web.servlet.HandlerMapping=org.images/springframework.web.servlet.handler.BeanNameUrlHandlerMapping,\
    org.images/springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping,\
    org.images/springframework.web.servlet.function.support.RouterFunctionMapping

org.images/springframework.web.servlet.HandlerAdapter=org.images/springframework.web.servlet.mvc.HttpRequestHandlerAdapter,\
    org.images/springframework.web.servlet.mvc.SimpleControllerHandlerAdapter,\
    org.images/springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter,\
    org.images/springframework.web.servlet.function.support.HandlerFunctionAdapter


org.images/springframework.web.servlet.HandlerExceptionResolver=org.images/springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver,\
    org.images/springframework.web.servlet.mvc.annotation.ResponseStatusExceptionResolver,\
    org.images/springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver

org.images/springframework.web.servlet.RequestToViewNameTranslator=org.images/springframework.web.servlet.view.DefaultRequestToViewNameTranslator

org.images/springframework.web.servlet.ViewResolver=org.images/springframework.web.servlet.view.InternalResourceViewResolver

org.images/springframework.web.servlet.FlashMapManager=org.images/springframework.web.servlet.support.SessionFlashMapManager
```

DispatcherServlet 类包含许多方法, 大致可以分为以下三类:

(1) 初始化相关处理类的方法, 比如 initMultipartResolver(), initLocaleResolver() 等.

(2) 响应 HTTP 请求的方法.

(3) 执行处理请求逻辑的方法.

DispatcherServlet 装配的组件, 具体内容如下所示:

- LocaleResolver: 本地化解析, 只允许一个实例. 因为 Images/Spring 支持国际化, 所以 LocalResover 解析客户端的 Locale 信息从而方便进行国际化. 如果没有找至, 使用默认的实现类 AcceptHeaderLocaleResolveH 为该类型的组件.

- ThemeResovler: 主题解析, 只允许一个实例. 通过它来实现一个页面多套风格, 即常见的类似于软件皮肤效果. 如果没有找到, 使用默认的实现类 FixedThemeResolver 作为该类型的组件.

- HandlerMapping: 请求到处理器的映射, 允许多个实例. 如果映射成功返回一个 HandlerExecutionChain 对象(包含一个 Handler 处理器［页面控制器］) 对象, 多个 Handlerlnterceptoi- 拦截器) 对象；如果 detectHandlerMappings 的属性为 true(默认为 true), 则根据类型匹配机制查找上下文及 Images/Spring 容器中所有类型为 HandlerMapping 的 Bean, 将它们作为该类型的组件. 如果 detectHandlerMappings 的属性为 false, 则查找名为 handlerMapping, 类型为 HandlerMapping 的 Bean 作为该类型组件. 如果以上两种方式都没有找到, 则使用 BeanNameUrlHandlerMapping 实现类创建该类型的组件. BeanNameUrlHandlerMapping 将 URL 与 Bean 名字映射, 映射成功的 Bean 就是此处的处理器.

- HandlerAdapter: 允许多个实例, HandlerAdapter 将会把处理器包装为适配器, 从而支持多种类型的处理器, 即适配器设计模式的应用, 从而很容易支持很多类型的处理器. 如 SimpleControllerHandlerAdapter 将对实现了 Controller 接口 的 Bean 进行适配, 并且按处理器的 handleRequest 方法进行功能处理. 默认使用 DispatcherServlet.properties 配置文件中指定的三个实现类分别创建一个适配器, 并将其添加到适配器列表中.

- HandlerExceptionResolver: 允许多个实例. 处理器异常解析可以将异常映射到相应的统一错误界面, 从而显示用户友好的界面(而不是给用户看到具体的错误信息). 默认使用 DispatcherServlet.properties 配置文件中定义的实现类.

- ViewNameTranslator: 只允许一个实例. 默认使用 DefaultRequestToViewNameTranslatoH 为该类型的组件.

- ViewResolver: 允许多个实例. ViewResolver 将把逻辑视图名解析为具体的 View, 通过这种策略模式, 很容易更换其他视图技术, 如 IntemalResourceViewResolver# 逻辑视图名映射为 JSP 视图.

- FlashMap 映射管理器：查找名为 FlashMapManager, 类型为 SessionFlashMapManager 的 bean 作为该类型组件, 用于管理 FlashMap, 即数据默认存储在 HttpSession 中.

需要注意的是, DispatcherServlet 装配的各种组件, 有些只允许一个实例, 有些则允许多个实例. 如果同一个类型的组件存在多个, 可以通过 Order 属性确定优先级的顺序, 值越小的优先级越高.

## HandlerMapping and HandlerAdapter

## HandlerMapping

处理映射器 HandlerMapping 是指请求到处理器的映射时, 允许有多个实例. 如果映射成功返回一个 HandlerExecutionChain 对象(包含一个 Handler 处理器［页面控制器］对象, 多个 Handlerinterceptor 拦截器) 对象. Images/Spring MVC 提供了多个处理映射器 HandlerMapping 实现类, 下面分别进行说明.

(1) BeanNamellrlHandlerMapping

BeanNameUrlHandlerMapping 是默认映射器, 在不配置的情况下, 默认就使用这个类来映射请求. 其映射规则是根据请求的 URL 与 Images/Spring 容器中定义的处理器 bean 的 name 属性值进行匹配, 从而在 Images/Spring 容器中找到 Handler (处理器) 的 bean 实例.

``` xml
<!--Default Handler Mapping-->
<bean class="org.images/springframework.web.servlet.handler.BeanNameUrlHandlerMapping"></bean>

<bean id="testController" name="/hello"
      class="self.defined.Controller"></bean>
```

(2) SimplellrlHandlerMapping

SimpleUrlHandlerMapping 根据浏览器 URL 匹配 prop 标签中的 key, 通过 key 找到对应的 Controller.

``` xml
<bean class="org.images/springframework.web.servlet.handler.SimpleUrlHandlerMapping">
  <property name="mapping">
    <props>
      <prop key="/hello">helloController</prop>
      <prop key="/test">testController</prop>
    </props>
  </property>
</bean>
<bean id="testController"
      name="/test" class="self.define.TestController"></bean>
```

上述配置了两个不同的 URL 映射, 对应于同一个 Controller 配置. 也就是说, 在浏览器中发起两个不同的 URL 请求, 会得到相同的处理结果.

## HandlerAdapter

处理适配器(HandlerAdapter) 允许多个实例, HandlerAdapter 将会把处理器包装为适配器, 从而支持多种类型的处理器, 即适配器设计模式的应用, 从而很容易支持多种类型的处理器. 如 SimpleControllerHandlerAdapter 将对实现了 Controller 接口的 Bean 进行适配, 并且按处理器的 handleRequest 方法进行功能处理. 默认使用 DispatcherServlet.properties 配置文件中指定的三个实现类分别创建一个适配器, 并将其添加到适配器列表中.

Images/Spring MVC 提供了多个处理适配器(HandlerAdapter) 实现类, 分别说明如下.

(1) SimpleControllerHandlerAdapter

SimpleControllerHandlerAdapter 支持所有实现 Controller 接口的 Handler 控制器, 是 Controller 实现类的适配器类, 其本质是执行 Controller 类中的 handleRequest 方法. SimpleControllerHandlerAdapter 的源码如下:

``` java
public class SimpleControllerHandlerAdapter
    implements HandlerAdapter {
    public SimpleControllerHandlerAdapter() {
    }

    public boolean supports(Object handler) {
        return handler instanceof Controller;
    }

    @Nullable
    public ModelAndView handle(HttpServletRequest request,
                               HttpServletResponse response,
                               Object handler)
        throws Exception {
        return ((Controller)handler).handleRequest(request, response);
    }

    public long getLastModified(HttpServletRequest request,
                                Object handler) {
        return handler instanceof LastModified ?
            ((LastModified)handler).getLastModified(request) :
            -1L;
    }
}
```

Controller 接口的定义也很简单, 仅仅定义了一个 handleRequest 方法, 具体源码如下:

``` java
// import lines ...

@FunctionalInterface
public interface Controller {
    @Nullable
    ModelAndView handleRequest(HttpServletRequest request,
                               HttpServletResponse response)
        throws Exception;
}
```

\(2\) HttpRequestHandlerAdapter

HttpRequestHandlerAdapter 本质是调用 HttpRequestHandler 的 handleRequest 方法, 请看下述代码示例:

``` java
public class HttpRequestHandlerAdapter
    implements HandlerAdapter {
    public HttpRequestHandlerAdapter() {
    }

    public boolean supports(Object handler) {
        return handler instanceof HttpRequestHandler;
    }

    @Nullable
    public ModelAndView handle(HttpServletRequest request,
                               HttpServletResponse response,
                               Object handler)
        throws Exception {
        ((HttpRequestHandler)handler).handleRequest(request, response);
        return null;
    }

    public long getLastModified(HttpServletRequest request,
                                Object handler) {
        return handler instanceof LastModified ?
            ((LastModified)handler).getLastModified(request) :
            -1L;
    }
}
```

HttpRequestHandlerAdapter 本质是 HttpRequestH andl er 的适配器, 最终调用 HttpRequestHandler 的 handleRequest 方法. 接口 HttpRequestHandler 的实现如下:

``` java
// import lines ...

@FunctionalInterface
public interface HttpRequestHandler {
    void handleRequest(HttpServletRequest request,
                       HttpServletResponse response)
        throws ServletException, IOException;
}
```

(3) RequestMappingHandlerAdapter

RequestMappingHandlerAdapter 其父类是 AbstractHandlerMethodAdapter 抽象类, AbstractHandlerMethodAdapter 只是简单地实现了 HandlerAdapter 中定义的接口, 最终还是在 RequestMappingHandlerAdapter 中对代码进行实现的, AbstractHandlerMethodAdapter 中增加了执行顺序 Order, 具体如图所示.

![RequestMappingHandlerAdapter 类继承关系](images/spring/10-4.png)

AbstractHandlerMethodAdapter 的源码如下:

``` java
public abstract class AbstractHandlerMethodAdapter
    extends WebContentGenerator
    implements HandlerAdapter, Ordered {

    // static variables ...

    public AbstractHandlerMethodAdapter() {
        super(false);
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public int getOrder() {
        return this.order;
    }

    public final boolean supports(Object handler) {
        return handler instanceof HandlerMethod &&
            this.supportsInternal((HandlerMethod)handler);
    }

    protected abstract boolean
        supportsInternal(HandlerMethod handlerMethod);

    @Nullable
    public final ModelAndView handle(HttpServletRequest request,
                                     HttpServletResponse response,
                                     Object handler)
        throws Exception {
        return this.handleInternal(request, response, (HandlerMethod)handler);
    }

    @Nullable
    protected abstract ModelAndView handleInternal(HttpServletRequest request,
                                                   HttpServletResponse response,
                                                   HandlerMethod handlerMethod)
        throws Exception;

    public final long getLastModified(HttpServletRequest request, Object handler) {
        return this.getLastModifiedInternal(request, (HandlerMethod)handler);
    }

    /** @deprecated */
    @Deprecated
    protected abstract long getLastModifiedInternal(HttpServletRequest request,
                                                    HandlerMethod handlerMethod);
}
```

从上述代码可知, RequestMappingHandlerAdapter 的处理逻辑主要由 handlelnternal() 实现, 而核心处理逻辑由方法 invokeHandlerMethod() 实现, invokeHandlerMethod 方法具体源码如下:

``` java
@Nullable
protected ModelAndView invokeHandlerMethod(HttpServletRequest request,
                                           HttpServletResponse response,
                                           HandlerMethod handlerMethod)
    throws Exception {
    ServletWebRequest webRequest =
        new ServletWebRequest(request, response);

    Object result;
    try {
        // binding data
        WebDataBinderFactory binderFactory =
            this.getDataBinderFactory(handlerMethod);
        ModelFactory modelFactory =
            this.getModelFactory(handlerMethod, binderFactory);
        ServletInvocableHandlerMethod invocableMethod =
            this.createInvocableHandlerMethod(handlerMethod);
        if (this.argumentResolvers != null) {
            invocableMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);
        }

        if (this.returnValueHandlers != null) {
            invocableMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
        }

        invocableMethod.setDataBinderFactory(binderFactory);
        invocableMethod.setParameterNameDiscoverer(this.parameterNameDiscoverer);
        // creating containter of modelAndView
        ModelAndViewContainer mavContainer =
            new ModelAndViewContainer();
        mavContainer.addAllAttributes(RequestContextUtils.getInputFlashMap(request));
        // init model
        modelFactory.initModel(webRequest, mavContainer, invocableMethod);
        mavContainer.setIgnoreDefaultModelOnRedirect(this.ignoreDefaultModelOnRedirect);
        AsyncWebRequest asyncWebRequest = WebAsyncUtils.createAsyncWebRequest(request, response);
        asyncWebRequest.setTimeout(this.asyncRequestTimeout);
        WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
        asyncManager.setTaskExecutor(this.taskExecutor);
        asyncManager.setAsyncWebRequest(asyncWebRequest);
        asyncManager.registerCallableInterceptors(this.callableInterceptors);
        asyncManager.registerDeferredResultInterceptors(this.deferredResultInterceptors);
        if (asyncManager.hasConcurrentResult()) {
            result = asyncManager.getConcurrentResult();
            mavContainer = (ModelAndViewContainer)asyncManager.getConcurrentResultContext()[0];
            asyncManager.clearConcurrentResult();
            LogFormatUtils.traceDebug(this.logger, (traceOn) -> {
                    String formatted = LogFormatUtils.formatValue(result, !traceOn);
                    return "Resume with async result [" + formatted + "]";
                });
            invocableMethod = invocableMethod.wrapConcurrentResult(result);
        }

        // invoking handler method
        invocableMethod.invokeAndHandle(webRequest, mavContainer, new Object[0]);
        if (!asyncManager.isConcurrentHandlingStarted()) {
            ModelAndView var15 =
                this.getModelAndView(mavContainer, modelFactory, webRequest);
            return var15;
        }

        result = null;
    } finally {
        webRequest.requestCompleted();
    }

    return (ModelAndView)result;
}
```

从上述代码可知, RequestMappingHandlerAdapter 内部对于每个请求都会实例化一个 ServletlnvocableHandlerMethod(InvocableHandlerMethod 的子类) 进行处理. ServletlnvocableHandlerMethod 类继承关系如图所示.

![ServletlnvocableHandlerMethod 类继承关系](images/spring/10-5.png)

InvocableHadlerMethod 类通过调用 getMethodArgumentValues() 获取方法的输入参数, 具体源码如下:

``` java
protected Object[] getMethodArgumentValues(NativeWebRequest request,
                                           @Nullable ModelAndViewContainer mavContainer,
                                           Object... providedArgs) throws Exception {
    MethodParameter[] parameters = this.getMethodParameters();
    if (ObjectUtils.isEmpty(parameters)) {
        return EMPTY_ARGS;
    } else {
        Object[] args = new Object[parameters.length];

        for(int i = 0; i < parameters.length; ++i) {
            MethodParameter parameter = parameters[i];
            parameter.initParameterNameDiscovery(this.parameterNameDiscoverer);
            args[i] = findProvidedArgument(parameter, providedArgs);
            if (args[i] == null) {
                if (!this.resolvers.supportsParameter(parameter)) {
                    throw new IllegalStateException(formatArgumentError(parameter,
                                                                        "No suitable resolver"));
                }

                try {
                    args[i] = this.resolvers.resolveArgument(parameter,
                                                             mavContainer,
                                                             request,
                                                             this.dataBinderFactory);
                } catch (Exception var10) {
                    if (logger.isDebugEnabled()) {
                        String exMsg = var10.getMessage();
                        if (exMsg != null && !exMsg.contains(parameter.getExecutable().toGenericString())) {
                            logger.debug(formatArgumentError(parameter, exMsg));
                        }
                    }

                    throw var10;
                }
            }
        }

        return args;
    }
}
```

从上述代码可知, 解析参数的方式和 handlerMappings, handlerAdapters 类似, 都是从一个 HandlerMethodArgumentResolver 列表中遍历, 找到一个能够处理的 bean, 然后调用 bean 的核心方法处理. HandlerMethodArgumentResolver 接口的定义如下所示:

``` java
public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(MethodParameter parameter);

    @Nullable
    Object resolveArgument(MethodParameter parameter,
                           @Nullable ModelAndViewContainer mavContainer,
                           NativeWebRequest webRequest,
                           @Nullable WebDataBinderFactory binderFactory)
        throws Exception;
}
```

HandlerMethodArgumentResolver 类通过 supportsParameter 筛选符合条件的 resolver, 然后调用 resolver 的 resolveArgument 解析前端参数. Images/Spring 提供许多 HandlerMethodArgumentResolver, 具体可以在 RequestMappingHandlerAdapter.afterPropertiesSetQ 方法中查看.

``` java
private List<HandlerMethodArgumentResolver> getDefaultArgumentResolvers() {
    List<HandlerMethodArgumentResolver> resolvers = new ArrayList(30);
    // annotation-based argument resolution
    resolvers.add(new RequestParamMethodArgumentResolver(this.getBeanFactory(), false));
    resolvers.add(new RequestParamMapMethodArgumentResolver());
    resolvers.add(new PathVariableMethodArgumentResolver());
    resolvers.add(new PathVariableMapMethodArgumentResolver());
    resolvers.add(new MatrixVariableMethodArgumentResolver());
    resolvers.add(new MatrixVariableMapMethodArgumentResolver());
    resolvers.add(new ServletModelAttributeMethodProcessor(false));
    resolvers.add(new RequestResponseBodyMethodProcessor(
                                                         this.getMessageConverters(),
                                                         this.requestResponseBodyAdvice));
    resolvers.add(new RequestPartMethodArgumentResolver(this.getMessageConverters(),
                                                        this.requestResponseBodyAdvice));
    resolvers.add(new RequestHeaderMethodArgumentResolver(this.getBeanFactory()));
    resolvers.add(new RequestHeaderMapMethodArgumentResolver());
    resolvers.add(new ServletCookieValueMethodArgumentResolver(this.getBeanFactory()));
    resolvers.add(new ExpressionValueMethodArgumentResolver(this.getBeanFactory()));
    resolvers.add(new SessionAttributeMethodArgumentResolver());
    resolvers.add(new RequestAttributeMethodArgumentResolver());
    // type-based argument resolution
    resolvers.add(new ServletRequestMethodArgumentResolver());
    resolvers.add(new ServletResponseMethodArgumentResolver());
    resolvers.add(new HttpEntityMethodProcessor(this.getMessageConverters(),
                                                this.requestResponseBodyAdvice));
    resolvers.add(new RedirectAttributesMethodArgumentResolver());
    resolvers.add(new ModelMethodProcessor());
    resolvers.add(new MapMethodProcessor());
    resolvers.add(new ErrorsMethodArgumentResolver());
    resolvers.add(new SessionStatusMethodArgumentResolver());
    resolvers.add(new UriComponentsBuilderMethodArgumentResolver());
    if (KotlinDetector.isKotlinPresent()) {
        resolvers.add(new ContinuationHandlerMethodArgumentResolver());
    }

    // custom arguments
    if (this.getCustomArgumentResolvers() != null) {
        resolvers.addAll(this.getCustomArgumentResolvers());
    }

    // default all
    resolvers.add(new PrincipalMethodArgumentResolver());
    resolvers.add(new RequestParamMethodArgumentResolver(this.getBeanFactory(), true));
    resolvers.add(new ServletModelAttributeMethodProcessor(true));
    return resolvers;
}
```

从上述代码可知, 除了 Images/Spring 提供的 RequestParamMethodArgumentResolver

PathVariableMethodArgumentResolver\> SessionAttributeMethodArgumentResolver 等默认 resolver 之外, 还可以自定义 resolver, 通过注解来指定处理的参数类型, 然后通过 getCustomArgumentResolvers 方法会注册到 revolver 列表. 下面以 RequestParamMethodArgumentResolver 为例做简单的分析, 具体类继承关系如图所示.

![ServletlnvocableHandlerMethod 类继承关系](images/spring/10-6.png)

RequestParamMethodArgumentResolver 父类是 AbstractNamedValueMethodArgumentResolver, 其中最核心的方法是 resolveArgument:

``` java
@Nullable
public final Object resolveArgument(MethodParameter parameter,
                                    @Nullable ModelAndViewContainer mavContainer,
                                    NativeWebRequest webRequest,
                                    @Nullable WebDataBinderFactory binderFactory)
    throws Exception {
    NamedValueInfo namedValueInfo =
        this.getNamedValueInfo(parameter);
    MethodParameter nestedParameter =
        parameter.nestedIfOptional();
    Object resolvedName = this.resolveEmbeddedValuesAndExpressions(namedValueInfo.name);
    if (resolvedName == null) {
        throw new IllegalArgumentException("Specified name must not resolve to null: [" +
                                           namedValueInfo.name + "]");
    } else {
        Object arg = this.resolveName(resolvedName.toString(),
                                      nestedParameter, webRequest);
        if (arg == null) {
            if (namedValueInfo.defaultValue != null) {
                arg =
                    this.resolveEmbeddedValuesAndExpressions(namedValueInfo.defaultValue);
            } else if (namedValueInfo.required && !nestedParameter.isOptional()) {
                this.handleMissingValue(namedValueInfo.name, nestedParameter, webRequest);
            }

            arg = this.handleNullValue(namedValueInfo.name, arg,
                                       nestedParameter.getNestedParameterType());
        } else if ("".equals(arg) && namedValueInfo.defaultValue != null) {
            arg = this.resolveEmbeddedValuesAndExpressions(namedValueInfo.defaultValue);
        }

        if (binderFactory != null) {
            WebDataBinder binder = binderFactory.createBinder(webRequest,
                                                              (Object)null, namedValueInfo.name);

            try {
                arg = binder.convertIfNecessary(arg, parameter.getParameterType(), parameter);
            } catch (ConversionNotSupportedException var11) {
                throw new MethodArgumentConversionNotSupportedException(arg,
                                                                        var11.getRequiredType(),
                                                                        namedValueInfo.name,
                                                                        parameter,
                                                                        var11.getCause());
            } catch (TypeMismatchException var12) {
                throw new MethodArgumentTypeMismatchException(arg, var12.getRequiredType(),
                                                              namedValueInfo.name,
                                                              parameter,
                                                              var12.getCause());
            }

            if (arg == null && namedValueInfo.defaultValue == null &&
                namedValueInfo.required &&
                !nestedParameter.isOptional()) {
                this.handleMissingValueAfterConversion(namedValueInfo.name,
                                                       nestedParameter,
                                                       webRequest);
            }
        }

        this.handleResolvedValue(arg,
                                 namedValueInfo.name,
                                 parameter,
                                 mavContainer,
                                 webRequest);
        return arg;
    }
}
```

由上述代码可知, Images/Spring MVC 框架将 ServletRequest 对象及处理方法的参数对象实例传递给 DataBinder, DataBinder 会调用装配在 Images/Spring MVC 上下文的 ConversionService 组件进行数据类型转换, 数据格式转换工作, 并将 ServletRequest 中的消息填充到参数对象中. 然后再调用 Validator 组件对绑定了请求消息数据的参数对象进行数据合法性校验, 并最终生成数据绑定结果 BindingResult 对象. BindingResuIt 包含已完成数据绑定的参数对象, 还包含相应的检验错误对象.

## ViewResoIver

## ViewResolver Overview

ViewResoIver 是 Images/Spring MVC 处理流程中的最后一个环节, Images/Spring MVC 流程最后返回给用户的视图为具体的 View 对象, View 对象包含 Model 对象, 而 Model 对象存放后端需要反馈给前端的数据. 视图解析器把一个逻辑上的视图名称解析为一个具体的 View 视图对象, 最终的视图可以是 JSP, Excek JFreeChart 等.

## Resolution Process

SpringMVC 的视图解析流程为:

(1) SpringMVC 调用目标方法, 将目标方法返回的 String, View, ModelMap 或 ModelAndView 都转换为一个 Model And View 对象.

(2) 通过视图解析器 ViewResoIver 将 ModelAndView 对象中的 View 对象进行解析, 将逻辑视图 View 对象解析为一个物理视图 View 对象.

(3) 调用物理视图 View 对象的 render() 方法进行视图渲染, 得到响应结果.

## Usual ViewResolver

SpringMVC 提供很多视图解析器类, 具体如图所示.

![ViewResoIver 类继承关系](images/spring/10-7.png)

下面介绍一些常用的视图解析器类. 除了上图所示的 resolver 之外, 还有 GroovyMarkupViewResolver, TilesViewResolver, 不过那些暂时不考虑, 所以先行省略了.

(1) ViewResolver

ViewResolver 是所有视图解析器的父类, 具体源码如下:

``` java
public interface ViewResolver {
    @Nullable
    View resolveViewName(String viewName,
                         Locale locale)
        throws Exception;
}
```

ViewResolver 的主要作用是把一个逻辑上的视图名称解析为一个真正的视图, 然后通过 View 对象进行渲染.

(2) AbstractCachingViewResolver

抽象类, 这种视图解析器会把解析过的视图保存起来, 然后在每次解析视图时先从缓存里面查找, 如果找到了对应的视图就直接返回, 如果没有找到就创建一个新的视图对象, 然后把它存放到用于缓存的 Map 中, 接着再把新建的视图返回. 使用这种视图缓存的方式可以把解析视图的性能问题降到最低.

(3) UrlBasedViewResolver

该类继承了 AbstractCachingViewResolver, 主要是提供一种拼接 URL 的方式来解析视图, 它可以通过 prefix 属性指定的前缀, 通过 suffix 属性指定后缀, 然后把返回的逻辑视图名称加上指定的前缀和后缀就是指定的视图 URL 了. 如 prefix=/WEB-INF/jsps/, suffix=.jsp, 返回的视图名称 viewName=test/indx, 贝 U UrlBasedViewResolver 解析出来的视图 URL 就是 AVEB-INF/jsps/test/index.jsp, 默认的 prefix 和 suffix 都是空串.

URLBasedViewResolver 支持返回的视图名称中包含 redirect: 前缀, 这样就可以支持 URL 在客户端的跳转, 如当返回的视图名称是 \"redirect: test.do\" 的时候, URLBasedViewResolver 发现返回的视图名称包含\"redirect: \" 前缀, 于是把返回的视图名称前缀\"redirect: "去掉, 取后面的 test.do 组成一个 Redirect View, Redirect View 中将把请求返回的模型属性组合成查询参数的形式组合到 redirect 的 URL 后面, 然后调用 HttpServletResponse 对象的 sendRedirect 方法进行重定向. 同样 URLBasedViewResolver 还支持 forword: 前缀, 对于视图名称中包含 forword: 前缀的视图名称将会被封装成一个 InternalResourceView 对象, 然后在服务器端利用 RequestDispatcher 的 forword 方式跳转到指定的地址. 使用 UrlBasedViewResolver 的时候必须指定属性 viewClass, 表示解析成哪种视图, 一般使用较多的就是 InternalResourceView, 利用它来展现 JSP, 但是当使用 JSTL 的时候必须使用 JstlViewo 具体实例如下所示:

``` xml
<bean
    class="org.images/springframework.web.servlet.view.UrlBasedViewResolver">
  <property name="prefix" value="/WEB-INF/"></property>
  <property name="suffix" value=".jsp"></property>
  <property name="viewClass"
            value="org.images/springframework.web.servlet.view.InternalResourceView"></property>
</bean>
```

上述代码中, 当返回的逻辑视图名称为 test 时, UrlBasedViewResolver 将逻辑视图名称加上定义好的前缀和后缀, 即 \"/WEB.INF/test.jsp\", 然后新建一个 viewClass 属性指定的视图类型予以返回, 即返回一个 URL 为\"/WEB-INF/test.jsp\" 的 InternalResourceView 对象.

(4) InternalResourceViewResolver

该类是 URLBasedViewResolver 的子类, 所以 URLBasedViewResolver 支持的特性它都支持. InternalResourceViewResolver 是使用最广泛的一个视图解析器. 可以把 InternalResourceViewResolver 解释为内部资源视图解析器, InternalResourceViewResolver 会把返回的视图名称都解析为 InternalResourceView 对象, InternalResourceView 会把 Controller 处理器方法返回的模型属性都存放到对应的 request 属性中, 然后通过 RequestDispatcher 在服务器端把请求 forword 重定向到目标 URL. 比如在 InternalResourceViewResolver 中定义了 prefix=AVEB-INF/, suffix=.jsp, 然后请求的 Controller 处理器方法返回的视图名称为 test, 那么这个时候 InternalResourceViewResolver 就会把 test 解析为一个 InternalResourceView 对象, 先把返回的模型属性都存放到对应的 HttpServletRequest 属性中, 然后利用 RequestDispatcher 在服务器端把请求 forword 到 /WEB-INF/test.jsp. 这就是 InternalResourceViewResolver 一个非常重要的特性.

存放在 `/WEB-INF/` 下面的内容是不能直接通过 request 请求的方式请求到的, 为了安全性考虑, 通常会把 JSP 文件放在 WEB-INF 目录下, 而 InternalResourceView 在服务器端跳转的方式可以很好地解决这个问题.

上述代码是一个 InternalResourceViewResolver 的定义, 根据该定义当返回的逻辑视图名称是 test 的时候, InternalResourceViewResolver 会给它加上定义好的前缀和后缀, 组成 \"/WEB-INF/test.jsp\" 的形式, 然后把它当做一个 InternalResourceView 的 URL 新建一个 InternalResourceView 对象返回.

(5) XmlViewResolver

在实验的环境 (5.3.22) 中这个解析器已经被标了 deprecated. 但还是说一些老的吧.

它继承自 AbstractCachingViewResolver 抽象类, 所以它也是支持视图缓存的. XmlViewResolver 需要给定一个 XML 配置文件, 该文件将使用和 Images/Spring 的 bean 工厂配置文件一样的 DTD 定义, 所以其实该文件就是用来定义视图的 bean 对象的. 在该文件中定义的每一个视图的 bean 对象都给定一个名字, 然后 XmlViewResolver 将根据 Controller 处理器方法返回的逻辑视图名称到 XmlViewResolver 指定的配置文件中寻找对应名称的视图 bean 用于处理视图. 该配置文件默认是 /WEB-INF/views.xml 文件, 如果不使用默认值的时候可以在 XmlViewResolver 的 location 属性中指定它的位置. XmlViewResolver 还实现了 Ordered 接口, 因此可以通过其 order 属性来指定在 ViewResolver 链中它所处的位置, order 的值越小优先级越高. 以下是使用 XmlViewResolver 的一个示例:

``` xml
<bean class="org.images/springframework.web.servlet.view.XmlViewResolver">
  <property name="location" value="/WEB-INF/views.xml"></property>
  <property name="order" value="1"></property>
</bean>
```

在 Images/Spring MVC 的配置文件中加入 XmlViewResolver 的 bean 定义. 使用 location 属性指定其配置文件所在的位置, order 属性指定当有多个 ViewResolver 的时候其处理视图的优先级.

在 XmlViewResolver 对应的配置文件中配置好所需要的视图定义, 视图配置文件 views.xml 具体的配置如下所示:

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.images/springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.images/springframework.org/schema/beans
                           http://www.images/springframework.org/schema/beansimages/spring-beans-3.0.xsd">
  <bean id="index"
        class="org.images/springframework.web.servlet.view.InternalResourceView">
    <property name="url" value="/index.jsp"></property>
  </bean>
</beans>
```

最后, 定义一个返回的逻辑视图名称为在 XmlViewResolver 配置文件中定义的视图名称 index:

``` java
@RequestMapping("/index")
public String index() {
    return "index";
}
```

当访问上面定义好的 index 方法的时候返回的逻辑视图名称为 \"index\", 这时候 Images/Spring MVC 会从 views.xml 配置文件中寻找 id 或者 name 为 \"index\" 的 bean 对象予以返回, 这里 Images/Spring 找到的是一个 URL 为 \"/index.jsp\" 的 InternalResourceView 对象, 然后进行视图解析, 将最终的视图页面显示给用户.

(6) BeanNameViewResolver

这个视图解析器跟 XmlViewResolver 有点类似, 也是通过把返回的逻辑视图名称匹配定义好的视图 bean 对象. 主要的区别有两点:

1.  BeanNameViewResolver 要求视图 bean 对象都定义在 Images/Spring 的 application context 中, 而 XmlViewResolver 是在指定的配置文件中寻找视图 bean 对象.

2.  BeanNameViewResolver 不会进行视图缓存.

下面来看一个具体的实例:

``` xml
<bean class="org.images/springframework.web.servlet.view.BeanNameViewResolver">
  <property name="order" value="1"></property>
</bean>
<bean id="test"
      class="org.images/springframework.web.servlet.view.InternalResourceView">
  <property name="url" value="/index.jsp"></property>
</bean>
```

上述代码中, 在 Images/Spring MVC 的配置文件中定义了一个 BeanNameViewResolver 视图解析器和一个 id 为 test 的 InternalResourceView bean 对象. 这样当返回的逻辑视图名称为 test 时, 就会解析为上面定义好的 id 为 test 的 InternalResourceView 对象, 然后跳转到 index.jsp 页面.

(7) ResourceBundleViewResolver

该类也是继承自 AbstractCaching ViewResolver 类, 但是它缓存的不是视图. 和 XmlViewResolver 一样, 它也需要有一个配置文件来定义逻辑视图名称和真正的 View 对象的对应关系, 不同的是 ResourceBundleViewResolver 的配置文件是一个属性文件, 而且必须是放在 classpath 路径下面的, 默认情况下这个配置文件是在 classpath 根目录下的 views.properties 文件, 如果不使用默认值, 则可以通过属性 baseName 或 baseNames 来指定. baseName R 是指定一个基名称, Images/Spring 会在指定的 classpath 根目录下寻找已指定的 baseName 开始的属性文件进行 View 解析, 如指定的 baseName 是 base, 那么 base.properties, baseabc.properties 等以 base 开始的属性文件都会被 Images/Spring 当做 ResourceBundleViewResolver 解析视图的资源文件. ResourceBundleViewResolver 使用的属性配置文件的内容类似于这样:

``` conf
resourceBundle.(class)=org.images/springframework.web.servlet.view.InternalResourceView
resourceBundle.url=/index.jsp
test.(class)=org.images/springframework.web.servlet.view.InternalResourceView
test.url=/test.jsp
```

在这个配置文件中定义了两个 InternalResourceView 对象, 一个名称是 resourceBundle, 对应的 URL 是 /index.jsp, 另一个名称是 test, 对应的 URL 是 /test.jsp. 从这个定义可以知道, resourceBundle 是对应的视图名称, 使用 resourceBundle.(class) 来指定它对应的视图类型, resourceBundle.url 指定这个视图的 URL 属性.

读者可以看到, resourceBundle 的 class 属性要用小括号包起来, 而它的 URL 属性为什么不需要呢？这就需要从 ResourceBundleViewResolver 进行视图解析的方法来说明. ResourceBundleViewResolver 还是通过 bean 工厂来获得对应视图名称的视图 bean 对象来解析视图的, 那么这些 bean 从哪里来呢？就是从定义的 properties 属性文件中来. 在 ResourceBundleViewResolver 第一次进行视图解析的时候会先 new 一个 BeanFactory 对象, 然后把 properties 文件中定义好的属性按照它自身的规则生成一个个的 bean 对象注册到该 BeanFactory 中, 之后会把该 BeanFactory 对象保存起来, 所以 ResourceBundleViewResolver 缓存的是 BeanFactory, 而不是直接缓存从 BeanFactory 中取出的视图 bean. 然后会从 bean 工厂中取出名称为逻辑视图名称的视图 bean 进行返回.

接下来介绍 Images/Spring 通过 properties 文件生成 bean 的规则. 它会把 properties 文件中定义的属性名称按最后一个点进行分割, 把点前面的内容当做是 bean 名称, 点后面的内容当做是 bean 的属性. 这其中有几个特别的属性, Images/Spring 把它们用小括号包起来了, 这些特殊的属性一般是对应的 attribute, 但不是 bean 对象所有的 attribute 都可以这样用. 其中(class) 是一个, 除 T(class) 之外, 还有(scope),(parent),(abstract),(lazy-init). 而除了这些特殊的属性之外的其他属性, Images/Spring 会把它们当做 bean 对象的一般属性进行处理, 就是 bean 对象对应的 propertyO 所以根据上面的属性配置文件将生成如下两个 bean 对象:

``` xml
<bean id="resourceBundle"
      class="org.images/springframework.web.servlet.view.BeanNameViewResolver">
  <property name="url" value="/index.jsp"></property>
</bean>
<bean id="test"
      class="org.images/springframework.web.servlet.view.InternalResourceView">
  <property name="url" value="/test.jsp"></property>
</bean>
```

(8) FreeMarkerViewResolver

FreeMarkerViewResolver 是 UrlBasedViewResolver 的一个子类, 它会把 Controller 处理方法返回的逻辑视图解析为 FreeMarkerViewo FreeMarkerViewResolver 会按照 UrlBasedViewResolver 拼接 URL 的方式进行视图路径的解析, 但是使用 FreeMarkerViewResolver 的时候不需要指定其 viewClass, 因为 FreeMarkerViewResolver 中已经把 viewClass 定死为 FreeMarkerView 了. 先在 Images/Spring MVC 的配置文件里面定义一个 FreeMarkerViewResolver 视图解析器, 并定义其解析视图的 order 顺序为 1, 代码示例如下:

``` xml
<bean
     class="org.images/springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
    <property name="prefix" value="fm_"></property>
    <property name="suffix" value=".ftl"></property>
    <property name="order" value="1"></property>
</bean>
```

当请求的处理器方法返回一个逻辑视图名称 viewName 的时候, 就会被该视图处理器加上前后缀解析为一个 URL 为 \"fin~viewName~.fU\" 的 FreeMarkerView 对象. 对于 FreeMarkerView 需要给定一个 FreeMarkerConfig 的 bean 对象来定义 FreeMarker 的配置信息. FreeMarkerConfig 是一个接口, Images/Spring 已经提供了一个实现, 它就是 FreeMarkerConfigurer. 可以通过在 Images/Spring MVC 的配置文件里定义该 bean 对象来定义 FreeMarker 的配置信息, 该配置信息将会在 FreeMarkerView 进行渲染的时候使用到. 对于 FreeMarkerConfigurer 而言, 最简单的就是配置一个 templateLoaderPath, 告诉 Images/Spring 应该到哪里寻找 FreeMarker 的模板文件. 这个 templateLoaderPath 也支持使用 \"classpath:\" 和 \"file:\" 前缀. 当 FreeMarker 的模板文件放在多个不同的路径下面的时候, 可以使用 templateLoaderPaths 属性来指定多个路径. 在这里指定模板文件放在 \"/WEB-INF/fireemarker/template\" 下面, 示例代码如下:

``` xml
<bean class="org.images/springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
  <property name="templateLoaderPath" value="/WEB-INF/freemarker/template"/>
</bean>
```

## ViewResolver Chain

在 Images/Spring MVC 中可以同时定义多个 ViewResolver 视图解析器, 然后它们会组成一个 ViewResolver 链. 当 Controller 处理器方法返回一个逻辑视图名称后 ViewResolver 链将根据其

中 ViewResolver 的优先级来进行处理. 所有的 ViewResolver 都实现了 Ordered 接口, 在 Images/Spring 中实现了这个接口的类都是可以排序的. ViewResolver 是通过 order 属性来指定顺序的, 默认都是最大值. 所以可以通过指定 ViewResolver 的 order 属性来实现 ViewResolver 的优先级, order 属性是 Integer 类型, order 越小优先级越高, 所以第一个进行解析的将是 ViewResolver 链中 order 值最小的那个.

如果 ViewResolver 进行视图解析后返回的 View 对象为 null, 则表示 ViewResolver 不能解析该视图, 这个时候如果还存在其他 order 值比它大的 ViewResolver, 就会调用剩余的 ViewResolver 中 order 值最小的那个来解析该视图, 依此类推. 当 ViewResolver 在进行视图解析后返回的是一个非空的 View 对象的时候, 则表示该 ViewResolver 能够解析该视图, 那么视图解析就完成了, 后续的 ViewResolver 将不会再用来解析该视图. 当定义的所有 ViewResolver 都不能解析该视图的时候, Images/Spring 就会抛出一个异常.

基于 Images/Spring 支持的这种 ViewResolver 链模式, 就可以在 Images/Spring MVC 应用中同时定义多个 ViewResolver, 给定不同的 order 值, 这样就可以对特定的视图进行处理, 以此来支持同一应用中有多种视图类型.

像 InternalResourceViewResolver 这种能解析所有的视图, 即永远能返回一个非空 View 对象的 ViewResolver, 一定要把它放在 ViewResolver 链的最后面.
