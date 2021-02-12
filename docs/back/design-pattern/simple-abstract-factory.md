### 简单工厂+抽象工厂模式

#### 定义

该模式主要是用来解决抽象工厂模式代码冗余的部分，取消掉抽象工厂接口和具体工厂类，使用简单工厂模式，在SimpleFactory中，根据给定的条件选择创建具体产品
#### 结构

![image.png](https://i.loli.net/2021/02/12/3M4qJGinaQpx9ST.png)


#### 具体实现
通过SimpleFactory（简单工厂类）可以看出，每次构造产品，都需要指定factoryName，否则无法判断选择哪一个工厂进行生产
- SimpleFactory（简单工厂类）

```
/**
* @description: 手机简单工厂
* @author: rule
* @date: 2019-07-21 18:48
**/
public class PhoneSimpleFactory {
    private static final String factoryName = "apple";
    public ISmartPhone createPhone() {
        ISmartPhone smartPhone = null;
        switch (factoryName) {
            case "apple":
                smartPhone = new ApplePhone();
                break;
            case "samsung":
                smartPhone = new SamsungPhone();
                break;
        }
        return smartPhone;
    }

    public IChip createChip() {
        IChip chip = null;
        switch (factoryName) {
            case "apple":
                chip = new AppleChip();
                break;
            case "samsung":
                chip = new SamsungChip();
                break;
        }
        return chip;
    }
}
```
- AbstractProduct接口（智能手机和芯片接口）

- 具体工厂类（BasketBallFactory、FootBallFactory和VolleyBallFactory）

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
- ConcreteProduct实现类（苹果手机、芯片和三星手机和芯片实现类）
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
 
 #### 简单+抽象测试类
 
```
/**
* @description: 简单+抽象工厂测试类
* @author: rule
* @date: 2019-07-21 18:55
**/
public class SimpleAbstractTest {
    public static void main(String[] args) {
        PhoneSimpleFactory simpleFactory = new PhoneSimpleFactory();
        ISmartPhone smartPhone = simpleFactory.createPhone();
        smartPhone.showNewestPhone();
    }
}
```
![image.png](https://i.loli.net/2021/02/12/qLwNTJbYAgVpzG1.png)

#### 优缺点

- 优点：
1. 减少了抽象工厂和具体工厂之间的代码。
2. 选择简单工厂模式来管理，如果新增产品的情况下，只需要改变SimpleFactory类即可，不需要像原来一样修改多个类。

- 缺点：
1. 在简单工厂类中需要进行判断，才能得出需要创建那个工厂，需要修改factoryName才行。
2. 不符合“ 开放-封闭”原则。

#### 改进（反射）

- config.xml（工厂配置文件）

```
<?xml version="1.0"?>
<config>
    <className>com.rule.factory.proimpl.SamsungPhone</className>
</config>
```
- ReflectFactory（反射工厂类）

```
/**
* @description: 手机反射工厂
* @author: rule
* @date: 2019-07-21 19:37
**/
public class PhoneReflectFactory {

    public static Object getBean() {
        try {
            //创建文档对象
            DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = dFactory.newDocumentBuilder();
            Document doc;
            doc = builder.parse(new File("simple-abstract-pattern/src/resources/config.xml"));
            //获取包含类名的文本节点
            NodeList nl = doc.getElementsByTagName("className");
            Node classNode = nl.item(0).getFirstChild();
            String cName = classNode.getNodeValue();
            //通过类名生成实例对象并将其返回
            Class c = Class.forName(cName);
            Object obj = c.newInstance();
            return obj;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public ISmartPhone createPhone() {
        ISmartPhone smartPhone = null;
        smartPhone = (ISmartPhone) getBean();
        return smartPhone;
    }

    public IChip createChip() {
        IChip chip = null;
        chip = (IChip) getBean();
        return chip;
    }
}
```
- SimpleAbstractTest（简单抽象测试类）

```
/**
* @description: 简单+抽象工厂测试类
* @author: rule
* @date: 2019-07-21 18:55
**/
public class SimpleAbstractTest {

    public static void main(String[] args) {
        PhoneSimpleFactory simpleFactory = new PhoneSimpleFactory();
        ISmartPhone smartPhone = simpleFactory.createPhone();
        smartPhone.showNewestPhone();
        System.out.println("======下面使用反射创建工厂=======");
        PhoneReflectFactory reflectFactory = new PhoneReflectFactory();
        reflectFactory.createPhone().showNewestPhone();
    }
}
```

> 使用反射解决了简单工厂模式每次新增产品时，都需要添加switch-case的条件，基本做到了“开放-封闭”的设计原则，但是这种方法比较复杂，需要对反射有一定的了解和解析xml文件才能实现