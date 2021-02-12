### 抽象工厂模式

#### 定义

提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类应用实例：工作了，为了参加一些聚会，肯定有两套或多套衣服吧，比如说有商务装（成套，一系列具体产品）、
时尚装（成套，一系列具体产品），甚至对于一个家庭来说，可能有商务女装、商务男装、时尚女装、时尚男装，
这些也都是成套的，即一系列具体产品。假设一种情况（现实中是不存在的，要不然，没法进入共产主义了，
但有利于说明抽象工厂模式），在您的家中，某一个衣柜（具体工厂）只能存放某一种这样的衣服（成套，一系列具体产品），
每次拿这种成套的衣服时也自然要从这个衣柜中取出了。用 OOP 的思想去理解，所有的衣柜（具体工厂）都是衣柜类的（抽象工厂）某一个，
而每一件成套的衣服又包括具体的上衣（某一具体产品），裤子（某一具体产品），这些具体的上衣其实也都是上衣（抽象产品），具体的裤子也都是裤子（另一个抽象产品）。

#### 结构

- AbstractFactory：抽象工厂接口，包括的是产品的创建方法，它负责工厂接口与产品接口之间的联系，不与具体实现产生联系。
- ConcreteFactory: 具体工厂实现，该类是工厂生产产品的具体实现。
- AbstractProductA：抽象产品接口，包括的该产品下的所有方法。
- ConcreteProductA：具体产品A实现, 该类是生产产品A的具体实现。
- 当新增产品C时，那么就需要AbstractFactory新增createProductC；ConcreteFactory也需要增加该产品的具体实现；新增AbstractProductC接口和ConcreteProductC具体产品C实现类。

![image.png](https://i.loli.net/2021/02/12/lE6i1ZvzxgYQtdh.png)

#### 具体实现
- AbstractFactory接口（手机工厂接口）

```
/**
* @description: 手机工厂接口
* @author: rule
* @date: 2019-07-20 21:35
**/
public interface IPhoneFactory {

    /**
     * 创建智能手机
     * @return
     */
    ISmartPhone createPhone();

    /**
     * 创建芯片
     * @return
     */
    IChip createChip();
}
```
- ConcreteFactory实现类（苹果工厂和三星工厂具体实现类）

```
/**
* @description: 苹果手机工厂
* @author: rule
* @date: 2019-07-20 21:37
**/
public class AppleFactory implements IPhoneFactory {

    @Override
    public ISmartPhone createPhone(){
        return new ApplePhone();
    }

    @Override
    public IChip createChip() {
        return new AppleChip();
    }
}
```
```
/**
* @description: 三星手机工厂
* @author: rule
* @date: 2019-07-20 21:38
**/
public class SamsungFactory implements IPhoneFactory {

    @Override
    public ISmartPhone createPhone(){
        return new SamsungPhone();
    }

    @Override
    public IChip createChip() {
        return new SamsungChip();
    }
}
```
- AbstractProduct接口（智能手机和芯片接口）

```
/**
* @description: 智能手机接口
* @author: rule
* @date: 2019-07-20 21:43
**/
public interface ISmartPhone {

    /**
     * 展示最新手机
     */
    void showNewestPhone();
}
```

```
/**
* @description: 芯片接口
* @author: rule
* @date: 2019-07-20 21:57
**/
public interface IChip {

    /**
     * 展示最新芯片
     */
    void showNewestChip();
}
```

- ConcreteProduct实现类（苹果手机、芯片和三星手机、芯片实现类）

```
/**
* @description: 苹果智能手机
* @author: rule
* @date: 2019-07-20 21:44
**/
public class ApplePhone implements ISmartPhone {

    @Override
    public void showNewestPhone() {
        System.out.println("苹果今年最新的手机是IphoneX1");
    }
}
```
 
 ```
/**
* @description: 苹果芯片
* @author: rule
* @date: 2019-07-20 21:58
**/
public class AppleChip implements IChip {

    @Override
    public void showNewestChip() {
        System.out.println("苹果今年最新的芯片是A12X");
    }
}
 ```
 
 ```
/**
* @description: 三星智能手机类
* @author: rule
* @date: 2019-07-20 21:44
**/
public class SamsungPhone implements ISmartPhone {

    @Override
    public void showNewestPhone() {
        System.out.println("三星今年最新的手机是SamsungS10");
    }
}
 ```
  
  ```
/**
* @description: 三星芯片
* @author: rule
* @date: 2019-07-20 21:58
**/
public class SamsungChip implements IChip {

    @Override
    public void showNewestChip() {
        System.out.println("三星今年最新的芯片是晓龙855");
    }
}
  ```
 
 
 #### 抽象工厂模式测试
 
```
/**
* @description: 抽象工厂测试类
* @author: rule
* @date: 2019-07-20 22:05
**/
public class AbstractFactoryTest {

    public static void main(String[] args) {
        IPhoneFactory appleFactory = new AppleFactory();
        ISmartPhone iPhone = appleFactory.createPhone();
        iPhone.showNewestPhone();
        IChip appleChip = appleFactory.createChip();
        appleChip.showNewestChip();
        System.out.println("================");
        IPhoneFactory samsungFactory = new SamsungFactory();
        ISmartPhone samsungPhone = samsungFactory.createPhone();
        samsungPhone.showNewestPhone();
        IChip samsungChip = samsungFactory.createChip();
        samsungChip.showNewestChip();
    }
}
```
![image.png](https://i.loli.net/2021/02/12/TKUY6Eslrvg7ZBW.png)

#### 优缺点

- 优点：
1. 当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用同一个产品族中的对象。
2. 遵循了“依赖倒置”的设计原则，实现面向接口编程。
3. 易于交换产品的系列，只需在改变具体工厂的初始化即可。

- 缺点：
1. 产品族扩展非常困难，要增加一个系列的某一产品，既要在抽象的 Creator 里加代码，又要在具体的里面加代码。
2. “开-闭”设计原则没有实现，因为如果需要新增产品，那么需要修改的地方就很多，包括抽象工厂、具体工厂。

- 使用场景
1. QQ 换皮肤，一整套一起换。 
2. 生成不同操作系统的程序。

> 注意：产品族难扩展，产品等级易扩展。
