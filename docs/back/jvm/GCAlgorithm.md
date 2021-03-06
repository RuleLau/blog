### 垃圾收集策略与算法

程序计数器、虚拟机栈、本地方法栈随线程而生，也随线程而灭；栈帧随着方法的开始而入栈，随着方法的结束而出栈。这几个区域的内存分配和回收都具有确定性，都会在方法结束或者线程结束时，内存自然就跟着回收了
所以，垃圾回收器关注是Java堆和方法区的内存

#### 判定对象是否存活
若一个对象不被任何对象或变量引用，那么它就是无效对象，需要被回收


#### 引用计数法

在对象头维护这一个counter计数器，对象被引用一次则计数器+1；若引用失效则计数器-1。当计数器为0时，就认为该对象无效。但是这样没有解决对象之间循环引用的问题。

![image.png](https://i.loli.net/2021/01/24/eo6QwZR1kLvFMmP.png)

#### 可达性算法
所有和GCRoots直接或间接关联的对象都是有效对象，和GC Roots没有关联的对象就是无效对象
GC Roots是指：
- Java虚拟机栈（栈帧中的本地变量表）中引用的对象
- 本地方法栈中引用的对象
- 方法区中常量引用的对象
- 方法区中类静态属性引用的对象
GC Roots并不包括堆中对象所引用的对象，这样就不会有循环引用的问题

#### 引用的种类
##### 强引用
类似 "Object obj = new Object()" 这类的引用，就是强引用，只要强引用存在，垃圾收集器永远不会回收被引用的对象。但是，如果我们错误地保持了强引用，比如：赋值给了 static 变量，那么对象在很长一段时间内不会被回收，会产生内存泄漏。

##### 软引用
软引用是一种相对强引用弱化一些的引用，可以让对象豁免一些垃圾收集，只有当 JVM 认为内存不足时，才会去试图回收软引用指向的对象。JVM 会确保在抛出 OutOfMemoryError 之前，清理软引用指向的对象。软引用通常用来实现内存敏感的缓存，如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存。

##### 弱引用
弱引用的强度比软引用更弱一些。当 JVM 进行垃圾回收时，无论内存是否充足，都会回收只被弱引用关联的对象。

##### 虚引用
虚引用也称幽灵引用或者幻影引用，它是最弱的一种引用关系。一个对象是否有虚引用的存在，完全不会对其生存时间构成影响。它仅仅是提供了一种确保对象被 finalize 以后，做某些事情的机制，比如，通常用来做所谓的 Post-Mortem 清理机制。

#### 判定finalize()是否有必要执行
JVM会判断此对象是否有必要执行finalize()方法，如果对象没有覆盖finalize()方法，或者finalize()方法已经被虚拟机调用过，那么视为没有必要执行，那么对象基本上就真的被回收了

如果对象被判定有必要执行finalize()方法，那么对象会被放入一个F-Queue队列中，虚拟机会按照较低的优先级执行finalize()方法，但不会确保所有的finalize()方法都会执行结束。如果 finalize() 方法出现耗时操作，虚拟机就直接停止指向该方法，将对象清除。

#### 对象重生或死亡
如果在执行finalize()方法时，将this赋给某一个引用，那么该对象就重生了，如果没有，那么就会被垃圾收集器清除

> 任何一个对象的 finalize() 方法只会被系统自动调用一次，如果对象面临下一次回收，它的 finalize() 方法不会被再次执行，想继续在 finalize() 中自救就失效了。

#### 回收方法区内存
方法区中存放的是生命周期较长的类信息、常量、静态变量，每次垃圾收集只有少量的垃圾被清除。主要清除是两种：

- 废弃常量
- 无用的类

#### 判定废弃常量
只要常量池中的常量不被任何变量或对象引用，那么这些常量就会被清除掉

#### 判定无用的类

- 该类的所有对象都已经被清除
- 加载该类的ClassLoader已经被回收
- 该类的java.lang.Class对象没有任何地方被引用，无法在任何地方通过反射访问该类方法

> 一个类被虚拟机加载进方法区，那么在堆中就会有一个代表该类的对象：java.lang.Class。这个对象在类被加载进方法区时创建，在方法区该类被删除时清除。


#### JVM老年代和新生代的比例

在Java中，堆被分为两个不同的区域：新生代、老年代。新生代又被分为三个区域：Eden、From Survivor、To Survivor
堆的内存模型大致为：
![image.png](https://i.loli.net/2021/01/24/ej5gaRlOY9IpiUQ.png)

从图中可以看出： 堆大小 = 新生代 + 老年代。其中，堆的大小可以通过参数 –Xms、-Xmx 来指定。
默认的，新生代 ( Young ) 与老年代 ( Old ) 的比例的值为 1:2 ( 该值可以通过参数 –XX:NewRatio 来指定 )，即：新生代 ( Young ) = 1/3 的堆空间大小。老年代 ( Old ) = 2/3 的堆空间大小。其中，新生代 ( Young ) 被细分为 Eden 和 两个 Survivor 区域，这两个 Survivor 区域分别被命名为 from 和 to，以示区分。
默认的，Eden : from : to = 8 : 1 : 1 ( 可以通过参数 –XX:SurvivorRatio 来设定 )，即： Eden = 8/10 的新生代空间大小，from = to = 1/10 的新生代空间大小。
JVM 每次只会使用 Eden 和其中的一块 Survivor 区域来为对象服务，所以无论什么时候，总是有一块 Survivor 区域是空闲着的。
因此，新生代实际可用的内存空间为 9/10 ( 即90% )的新生代空间。


#### 垃圾收集算法

##### 标记-清除算法

标记的过程是：遍历所有的 GC Roots，然后将所有 GC Roots 可达的对象标记为存活的对象。

清除的过程将遍历堆中所有的对象，将没有标记的对象全部清除掉。与此同时，清除那些被标记过的对象的标记，以便下次的垃圾回收。
也可以反过来，标记需要清除的对象，然后回收掉标记的对象
不足：

- 效率问题：标记和清除两个过程的效率都不高
- 空间问题：标记清除之后会产生大量不连续的内存碎片，碎片太多可能导致以后需要分配较大对象时，无法找到足够的连续内存而不得不提前触发另一次垃圾收集动作。

##### 复制算法（新生代）

它将可用内存按容量划分为大小相等的两块，每次只使用其中的一块。当这一块内存用完，需要进行垃圾收集时，就将存活者的对象复制到另一块上面，然后将第一块内存全部清除。这种算法有优有劣：

- 优点：不会有内存碎片的问题。
- 缺点：内存缩小为原来的一半，浪费空间

新生代中使用的算法：
- 为了解决空间利用率问题，可以将内存分为三块： Eden、From Survivor、To Survivor，比例是 8:1:1，每次使用 Eden 和其中一块 Survivor。回收时，将 Eden 和 Survivor 中还存活的对象一次性复制到另外一块 Survivor 空间上，最后清理掉 Eden 和刚才使用的 Survivor 空间。这样只有 10% 的内存被浪费，清除后的Eden和From Survivor区都是空的。那么就会将To
Survivor区中存活的对象的年龄设置为1，以后对象在Survivor区每熬过一次Minor GC，就将对象的年龄 + 1，当这些年龄达到设置的阈值（默认的是15），这些对象就会被放进老年代


##### 分配担保

为对象分配内存空间时，如果 Eden+Survivor 中空闲区域无法装下该对象，会触发 Minor GC 进行垃圾收集。但如果 Minor GC 过后依然有超过 10% 的对象存活，这样存活的对象直接通过分配担保机制进入老年代，然后再将新对象存入 Eden 区。

##### 标记-整理（老年代）

标记：它的第一个阶段与标记/清除算法是一模一样的，均是遍历 GC Roots，然后将存活的对象标记。

整理：移动所有存活的对象，且按照内存地址次序依次排列，然后将末端内存地址以后的内存全部回收。因此，第二阶段才称为整理阶段。这是一种老年代的垃圾收集算法。老年代的对象一般寿命比较长，因此每次垃圾回收会有大量对象存活，如果采用复制算法，每次需要复制大量存活的对象，效率很低。


##### 分代收集算法

根据对象存活周期的不同，将内存划分为几块。一般是把 Java 堆分为新生代和老年代，针对各个年代的特点采用最适当的收集算法。

- 新生代：复制算法
- 老年代：标记-清除算法、标记-整理算法
