### Executors

#### 介绍
ExecutorService继承于Executor接口，他提供了更为丰富的线程实现方法，比如ExecutorService提供关闭自己的方法，以及为跟踪一个或多个异步任务执行状况而生成Future的方法。 
ExecutorService有三种状态：运行、关闭、终止。创建后便进入运行状态，当调用了shutdown()方法时，便进入了关闭状态，此时意味着ExecutorService不再接受新的任务，
但是他还是会执行已经提交的任务，当所有已经提交了的任务执行完后，便达到终止状态。如果不调用shutdown方法，ExecutorService方法会一直运行下去，系统一般不会主动关闭。

#### 常用方法
Executors提供了工厂的方法来创建线程池，返回的线程池都实现了ExecutorService接口。

- public static ExecutorService newFixedThreadPool(int n）
创建固定数目的线程的线程池。newFixedThreadPool于cacheThreadPool差不多。也是能reuse就用，但是不能随时创建新的线程；
任意时间点，只能够最多有固定的数目的线程存在，此时如果有新的线程的创建，只能放在等待队列中，只有当线程池中的一些线程终止被扔出线程池后，才进入线程池进行运行。
和cacheThreadPool不同，FixedThreadPool没有IDLE机制，所以FixedThreadPool多数针对于很稳定的线程开发，多用于服务器。
fixedThreadPool和cacheThreadPool一样，同用一个底层池，只不过参数不同，fix线程固定，并且是0sIDLE无IDLE；cache线程支持0-Integer.MAX_VALUE,60s的IDLE。

- public static ExecutorService newCacheThreadPool()
创建一个可缓存池，调用execute将重用以前构造的线程(如果能够使用的话)。如果没有线程可用，那么创建一个线程到线程池中。终止并移除线程池中超过60s没有被使用过的线程。
缓存池一般用于运行生存期很短的异步线程任务。
放入cacheThreadPool中的线程不用担心其结束，超时后会被自动终止。
缺省值timeout=60s

- public static ExecutorService newSingleThreadExecutor()
创建一个单线程化的Executor。
用的是和cache和fixed池子相同的底层池，无IDLE。

- public static ScheduleExecutorService newScheduleThreadPool(int corePoolSize)
创建一个支持定时及周期性的任务执行的线程池，多数情况可以代替Timer类。Timer存在以下缺陷
Timer类不管启动多少定时器，但它只会启动一条线程，当有多个定时任务时，就会产生延迟。如：我们要求一个任务每隔3S执行，且执行大约需要10S，第二个任务每隔5S执行，两个任务同时启动。
若使用Timer我们会发现，第而个任务是在第一个任务执行结束后的5S才开始执行。这就是多任务的延时问题。若多个定时任务中有一个任务抛异常，那所有任务都无法执行。
Timer执行周期任务时依赖系统时间。若系统时间发生变化，那Timer执行结果可能也会发生变化。而ScheduledExecutorService基于时间的延迟，
并非时间，因此不会由于系统时间的改变发生执行变化。 综上所述，定时任务要使用ScheduledExecutorService取代Timer。

#### 任务 Runnable

任务分为两类：实现 Runnable 和实现 Callable 的类。两者都可以被ExecutorService执行，但是Runnable任务是没有返回值，而Callable任务有返回值。
而且Callable的Call方法只能通过ExecutorService的submit方法执行，并返回一个Future，表示任务等待完成的Future。
- Callable接口类似于Runnable，两者都是为那些其实例可能被另一个线程执行的类设计的。但是 Runnable 不会返回结果，
并且无法抛出经过检查的异常而Callable又返回结果，而且当获取返回结果时可能会抛出异常。Callable中的call()方法类似Runnable的run()方法，区别同样是有返回值，后者没有。
- 当将一个Callable的对象传递给ExecutorService的submit方法，则该call方法自动在一个线程上执行，并且会返回执行结果Future对象。同样，将Runnable的对象传递给ExecutorService的submit方法，
则该run方法自动在一个线程上执行，并且会返回执行结果Future对象，但是在该Future对象上调用get方法，将返回null。

