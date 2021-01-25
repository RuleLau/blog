### synchronized

synchronized关键字是jvm提供的一个用于并发加锁的关键字，主要用来是解决多线程导致的数据不正确的场景

#### 主要形式

1. 普通同步方法，锁的是当前实例对象；
   - 加在对象方法前，锁住整个方法
   ```
    private synchronized void syncMethod() throws Exception {
        for (int i = 0; i < 50; i++){
            count++;
            Thread.sleep(50);
            System.out.println(Thread.currentThread().getName() + ":" + count);
        }
    }
   ```
   这种使用方法，主要是用来锁住同一对象的，假设现在有两个不同的对象，调用这个方法，那么关键字synchornized关键字不会起到作用
2. 静态同步方法，锁的是当前类的class对象；
    - synchronized关键字加在类方法前：因为synchronized加在类方法前，代表的意思是锁住整个类。
      在不同的线程中，调用同步方法是互斥的。
     ```
        private static synchronized void syncStaticMethod1() throws Exception {
            for (int i = 0; i < 50; i++){
                count++;
                Thread.sleep(50);
                System.out.println(Thread.currentThread().getName() + "1:" + count);
            }
        }
   ```
3. 同步方法块，锁的是Synchorinezd括号里配置的对象,可以是实例对象也可以是类对象；

#### 原理
在synchronized在JVM中的实现原理是，基于进入和退出Monitor对象来实现方法同步和代码块同步。代码块同步使用的是
monitorenter和monitorexit指令实现。
![image.png](https://i.loli.net/2021/01/25/y1KmFSlkujeN5D6.png)

#### 锁的升级

锁一共有4种状态，从低到高是：无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态，锁只能进行进行升级，不能降级。

- 偏向锁状态
    ![image.png](https://i.loli.net/2021/01/25/wEelpPYSO68NiCm.png)
    - 撤销偏向锁
    ![image.png](https://i.loli.net/2021/01/25/j24Phz6kcpMr3d8.png)
- 轻量级锁
自旋定义：在两个线程同时获取锁时，线程1和线程2就存在竞争，那么当前线程1就会采用等待线程2释放锁，然后再去获取锁。当前自旋的时候，
需要设置限度。不然就会导致线程1一直等待，占用CPU。如果超过时间没有获取到，那么就会将线程1挂起。
    - 轻量级锁加锁
    ![image.png](https://i.loli.net/2021/01/25/p1GLatBFZ6kbjRo.png)
    
    - 轻量级锁解锁
    使用原子的CAS操作将Displaced Mark Word替换为原对象头，如果成功，则表示没有竞争发生。如果失败，表示当前锁存在竞争。锁就会膨胀为重量级锁。
    
- 重量级锁
    阻塞线程，等待释放，再重新获取锁
    
#### 锁对比
![image.png](https://i.loli.net/2021/01/25/HKhRxgUpzbD3dZ9.png)

 