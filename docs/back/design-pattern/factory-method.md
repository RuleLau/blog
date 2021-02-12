### 工厂方法模式

#### 定义

定义一个用于创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。

#### 结构

![](https://ftp.bmp.ovh/imgs/2021/02/a73475fdbe13cd54.png)


#### 具体实现
目前有企业需要生产篮球、足球和排球。目前准备给每一种球类有一个对应的工厂，它们都继承于一个抽象球工厂类。当然也有一个抽象的产品球类，具体产品篮球、足球和排球类都继承它。他们都有共同的方法就是玩，具体实现如下
- 抽象工厂类（BallFactory）

```
/**
*
* @description: 抽象球工厂类
* @author: liurui-1
* @date: 2019/7/8 18:00
* @version: 1.0.0
*/
public abstract class BallFactory {
    public abstract Ball createFactory();
}
```
- ConcreteFactory实现类（苹果工厂和三星工厂具体实现类）

- 具体工厂类（BasketBallFactory、FootBallFactory和VolleyBallFactory）

```
/**
*
* @description: 篮球工厂类
* @author: liurui-1
* @date: 2019/7/8 17:27
* @version: 1.0.0
*/
public class BasketBallFactory extends BallFactory {
    @Override
    public Ball createFactory() {
        return new BasketBall();
    }
}
```
```
/**
*
* @description: 足球工厂类
* @author: liurui-1
* @date: 2019/7/8 17:28
* @version: 1.0.0
*/
public class FootBallFactory extends BallFactory {

    @Override
    public Ball createFactory() {
        return new FootBall();
    }
}
```

```
/**
*
* @description: 排球工厂类
* @author: liurui-1
* @date: 2019/7/8 17:31
* @version: 1.0.0
*/
public class VolleyBallFactory extends BallFactory {

    @Override
    public Ball createFactory() {
        return new VolleyBall();
    }
}
```

- 抽象产品类（Ball）

```
/**
*
* @description: 抽象球产品类
* @author: liurui-1
* @date: 2019/7/8 17:35
* @version: 1.0.0
*/
public abstract class Ball {
    public abstract void play();
}
```
 
 - 具体产品类（BasketBall、FootBall和VolleyBall）
 ```
/**
*
* @description: 篮球具体产品类
* @author: liurui-1
* @date: 2019/7/8 17:39
* @version: 1.0.0
*/
public class BasketBall extends Ball {
    @Override
    public void play() {
        System.out.println("打篮球");
    }
}
 ```
 
 ```
/**
* @description: 足球具体产品类
* @author: liurui-1
* @date: 2019/7/8 17:40
* @version: 1.0.0
*/
public class FootBall extends Ball {

    @Override
    public void play() {
        System.out.println("踢足球");
    }
}
 ```
  
  ```
/**
* @description: 排球具体产品类
* @author: liurui-1
* @date: 2019/7/8 17:39
* @version: 1.0.0
*/
public class VolleyBall extends Ball {

    @Override
    public void play() {
        System.out.println("打排球");
    }
}
  ```
 
 
 #### 工厂方法模式测试
 
```
/**
* @description: 测试工厂类
* @author: liurui-1
* @date: 2019/7/8 17:44
* @version: 1.0.0
*/
public class FactoryTest {

    public static void main(String[] args) {
        BallFactory basketBallFactory = new BasketBallFactory();
        Ball basketBall = basketBallFactory.createFactory();
        basketBall.play();
        System.out.println("===================");
        BallFactory footBallFactory = new FootBallFactory();
        Ball footBall = footBallFactory.createFactory();
        footBall.play();
        System.out.println("===================");
        BallFactory volleyBallFactory = new VolleyBallFactory();
        Ball volleyBall = volleyBallFactory.createFactory();
        volleyBall.play();
    }
}
```
![image.png](https://i.loli.net/2021/02/12/7x4GFV5gbIWUofH.png)

#### 优缺点

- 优点：
1. 遵循“开-闭原则”，如果需求变更，需要再进行添加乒乓球类，那么只需要在原来的基础上添加乒乓球工厂类和乒乓球产品类，不需要修改原来的代码
2. 降低了代码的耦合性。
3. 符合“单一职责原则”，每一个工厂只负责自己的产品，不会涉及其它的产品。

- 缺点：
1. 一个具体工厂只能创建一种具体产品。
2. 当增加需求时，会增加了代码量。

> 注意：工厂方法和简单工厂的区别：简单工厂模式的最大优点在于工厂类中包含了必要的逻辑判断，根据用户的选择条件动态生成实例化的类，对于用户来说，去除了对具体产品的依赖。
>而工厂方法则是用户决定实例化那个工厂，相当于是将判断生成实例化，放在了用户端，而不是工厂代码中。
