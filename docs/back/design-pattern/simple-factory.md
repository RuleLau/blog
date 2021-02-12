### 简单工厂模式

#### 定义
实例化对象的时候不再使用 new Object()形式，可以根据用户的选择条件来实例化相关的类。对于客户端来说，
去除了具体的类的依赖。只需要给出具体实例的描述给工厂，工厂就会自动返回具体的实例对象。
工厂的意思可以理解为一个兵工厂中，可以生产多种武器，包括：手枪、步枪、狙击枪等。
但是这些类型的枪又属于枪的子类。如果不采用简单工厂的设计模式，采取最原始的模式就是：
分别新建三个子类，Pistol（手枪类），Rifle（步枪），Snipe（狙击枪）。它们都有共同的属性，
例如子弹直径（diameter），射速(shootSpeed)，还有公共的方法shoot（射击）方法等。
那么就会在三个类中出现重复的属性。当然你会想到新建一个基类Gun（枪类），
将公共的属性都添加到这个基类中，然后其他的子类就继承这个基类。这样做当然就解决了代码冗余的问题。
但是这样起不到一个统一管理的目的。用户不知道该去实例化那个对象，将来会不会增加实例化的对象。
那么到现在就应该考虑用一个单独的类来做创造实例的过程，这就是工厂。

#### 具体实现
- 先新建一个Gun（枪类）基类：

```
/**
* @description: 枪基类
* @author: rule
* @date: 2019-06-30 22:45
**/
public class Gun {

    /**
     * 枪名
     */
    private String gunName;

    /**
     * 子弹直径
     */
    private double diameter;

    /**
     * 射速
     */
    private double shootSpeed;

    /**
     * 射击方法
     */
    public void Shoot () {
        System.out.println("这里所有枪都可以射击");
    }
}
```
- 分别新建三个枪的子类：Pistol（手枪类）、Rifle（步枪类）、Snipe（狙击枪类）

```
/**
* @description: 手枪类
* @author: rule
* @date: 2019-06-30 22:54
**/
public class Pistol extends Gun {

    @Override
    public void Shoot() {
        System.out.println("这把" + getGunName() + "手枪" + "，子弹直径为" + getDiameter() + "mm，射速为" + getShootSpeed() + "km/s");
    }
}
```

```
/**
* @description: 步枪类
* @author: rule
* @date: 2019-06-30 22:55
**/
public class Rifle extends Gun {

    @Override
    public void Shoot() {
        System.out.println("这把" + getGunName() + "步枪" + "，子弹直径为" + getDiameter() + "mm，射速为" + getShootSpeed() + "km/s");
    }
}
```

```
/**
* @description: 狙击枪类
* @author: rule
* @date: 2019-06-30 22:55
**/
public class Snipe extends Gun {

    @Override
    public void Shoot() {
        System.out.println("这把" + getGunName() + "狙击枪" + "，子弹直径为" + getDiameter() + "mm，射速为" + getShootSpeed() + "km/s");
    }
}
```

- 新建GunFactory（兵工厂类）

```
/**
* @description: 枪工厂
* @author: rule
* @date: 2019-06-30 22:51
**/
public class GunFactory {

    public static Gun createGun(String  gunName) {
        Gun gun = null;
        if (gunName.equals("Pistol")) {
            gun = new Pistol();
        }else if (gunName.equals("Rifle")) {
            gun = new Rifle();
        }else if (gunName.equals("Snipe")) {
            gun = new Snipe();
        }
        return gun;
    }
}
```
 
 #### 简单工厂模式测试
 
```
/**
* @description: 兵工厂测试类
* @author: rule
* @date: 2019-06-30 23:29
**/
public class GunFactoryTest {

    public static void main(String[] args) {
        Gun gun = null;
        gun = GunFactory.createGun("Pistol");
        gun.setGunName("沙鹰");
        gun.setDiameter(3);
        gun.setShootSpeed(60);
        gun.Shoot();
    }
}
```
![image.png](https://i.loli.net/2021/02/12/bwmcH6NEuTnUfAo.png)

#### 优缺点
根据上述的测试例子，相信大家都对简单工厂模式有了基本的了解，先谈谈它的优缺点：
1. 简单工厂使用了java中的继承、封装、多态特性，决定兵工厂的生产什么类型的枪的决定权交到了用户的手中。根据用户自己的需要，生成合适的枪类。
2. 模块分明，起到了可维护性。当然，缺点也是存在的，当我需要增加冲锋枪类时，需要新建子类去继承基类，然后再去修改兵工厂中的createGun方法，这其实就使得代码的结构出现了高耦合了，因为我修改一个子类，最坏的情况是要修改自己类和兵工厂的类。
这样其实也没有做到“高内聚-低耦合”的设计原则。
