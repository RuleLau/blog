### 线程安全的策略

#### 不可变的对象
不可变对象满足条件：
1. 对象创建以后及其状态就不能修改；
2. 对象所有域都是final类型；
3. 对象是正确创建的（在对象创建期间，this引用没有逸出）;

final关键字：类、方法、变量
1. 修饰类：不能被继承
2. 修饰方法：锁定方法不能被继承类继承；效率；
3. 修饰变量：基本数据类型变量初始值不可改变，引用类型变量不可指向其他地址，但是其中的值可以被改变；
