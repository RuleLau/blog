### ThreadPool - 分析-上

#### 介绍

线程池上一篇文章已经简单介绍了线程池，那么这一篇就深入了解线程池的实现机制

简单看下线程池的结构图：

![image.png](https://i.loli.net/2021/01/26/YDaAW7OVbyFItUe.png)

ThreadPoolExecutor继承了 AbstractExecutorService， AbstractExecutorService 实现了 ExecutorService 接口，
ExecutorService 继承了 Executor 接口

- Executor 接口只定义了简单的方法，需要执行的具体任务的方法，也是最重要的方法
    ```
    /**
       执行给定的任务，这个任务可能执行在一个新的线程、一个线程池或者是回调的线程
     * Executes the given command at some time in the future.  The command
     * may execute in a new thread, in a pooled thread, or in the calling
     * thread, at the discretion of the {@code Executor} implementation.
     * 
     * @param command the runnable task
     * @throws RejectedExecutionException if this task cannot be
     * accepted for execution
     * @throws NullPointerException if command is null
     */
    void execute(Runnable command);
    ```
- ExecutorService 丰富了关于线程任务的其他方法，例如等待终止，是否终止、提交等
    
    - `T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)`
      
      只有其中的一个任务结束了，就可以返回，返回执行完的那个任务的结果
    - `List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)`
  
      执行所有任务，返回 Future 类型的一个 list
    - `Future<T> submit(Runnable task, T result);`
    
      提交一个 Runnable 任务，第二个参数将会放到 Future 中，作为返回值
    - `boolean awaitTermination(long timeout, TimeUnit unit)`
    - `boolean isShutdown();`
    
      线程池是否已关闭
    - `List<Runnable> shutdownNow();`
    
      关闭线程池，尝试停止正在执行的所有任务，不接受继续提交新任务 
    - 。。。
- AbstractExecutorService 抽象类，将实现的接口 ExecutorService 中的方法进行大体的结构的实现，但是具体的
方法 execute() 方法 则交给自己的子类去实现，这是典型的模板设计模式

    ```$xslt
    //提交一个 Callable 任务
    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        将任务包装成 FutureTask
        RunnableFuture<T> ftask = newTaskFor(task);
        // 子类实现
        execute(ftask);
        return ftask;
    }
   ```
  
#### AbstractExecutorService 的分析

上面说了 AbstractExecutorService 是个抽象类，负责实现父类的方法，那么来看下具体的实现方法

- `RunnableFuture<T> newTaskFor(Runnable runnable, T value)`：RunnableFuture 是用于获取执行结果的，我们常用它的子类 FutureTask
- `RunnableFuture<T> newTaskFor(Callable<T> callable)`： 这两个 newTaskFor 方法用于将我们的任务包装成 FutureTask 提交到线程池中执行

下面深入分析两个方法：invokeAny() 和 invokeAll()

- `T doInvokeAny(Collection<? extends Callable<T>> tasks, boolean timed, long nanos)`: 将 tasks 集合中的任务提交到线程池执行，任意一个线程执行完后就可以结束了
第二个参数 timed 代表是否设置超时机制，超时时间为第三个参数，如果 timed 为 true，同时超时了还没有一个线程返回结果，那么抛出 TimeoutException 异常

```
private <T> T doInvokeAny(Collection<? extends Callable<T>> tasks,
                            boolean timed, long nanos)
        throws InterruptedException, ExecutionException, TimeoutException {
        if (tasks == null)
            throw new NullPointerException();
        // 任务数
        int ntasks = tasks.size();
        if (ntasks == 0)
            throw new IllegalArgumentException();
        //
        List<Future<T>> futures= new ArrayList<Future<T>>(ntasks);
 
        // ExecutorCompletionService 不是一个真正的执行器，参数 this 才是真正的执行器
        // 它对执行器进行了包装，每个任务结束后，将结果保存到内部的一个 completionQueue 队列中
        // 这也是为什么这个类的名字里面有个 Completion 的原因吧。
        ExecutorCompletionService<T> ecs =
            new ExecutorCompletionService<T>(this);
        try {
            // 用于保存异常信息，此方法如果没有得到任何有效的结果，那么我们可以抛出最后得到的一个异常
            ExecutionException ee = null;
            long lastTime = timed ? System.nanoTime() : 0;
            Iterator<? extends Callable<T>> it = tasks.iterator();


            // 首先先提交一个任务，后面的任务到下面的 for 循环一个个提交
            futures.add(ecs.submit(it.next()));
            // 提交了一个任务，所以任务数量减 1
            --ntasks;
            // 正在执行的任务数(提交的时候 +1，任务结束的时候 -1)
            int active = 1;
            for (;;) {
                // ecs 上面说了，其内部有一个 completionQueue 用于保存执行完成的结果
                // BlockingQueue 的 poll 方法不阻塞，返回 null 代表队列为空
                Future<T> f = ecs.poll();
                // 为 null，说明刚刚提交的第一个线程还没有执行完成
                // 在前面先提交一个任务，加上这里做一次检查，也是为了提高性能
                if (f == null) {
                    if (ntasks > 0) {
                        --ntasks;
                        futures.add(ecs.submit(it.next()));
                        ++active;
                    }
                    // 这里是 else if，不是 if。这里说明，没有任务了，同时 active 为 0 说明
                    // 这里的 active == 0，说明所有的任务都执行失败，那么这里是 for 循环出口
                    else if (active == 0)
                        break;
                    // 这里也是 else if。这里说的是，没有任务了，但是设置了超时时间，这里检测是否超时
                    else if (timed) {
                        // 带等待的 poll 方法
                        f = ecs.poll(nanos, TimeUnit.NANOSECONDS);
                        // 如果已经超时，抛出 TimeoutException 异常，这整个方法就结束了
                        if (f == null)
                            throw new TimeoutException();
                        long now = System.nanoTime();
                        nanos -= now - lastTime;
                        lastTime = now;
                    }
                    // 这里是 else。说明，没有任务需要提交，但是池中的任务没有完成，还没有超时(如果设置了超时)
                    // take() 方法会阻塞，直到有元素返回，说明有任务结束了
                    else
                        f = ecs.take();
                }
                /*
                 * 我感觉上面这一段并不是很好理解，这里简单说下。
                 * 1. 首先，这在一个 for 循环中，我们设想每一个任务都没那么快结束，
                 *     那么，每一次都会进到第一个分支，进行提交任务，直到将所有的任务都提交了
                 * 2. 任务都提交完成后，如果设置了超时，那么 for 循环其实进入了“一直检测是否超时”
                       这件事情上
                 * 3. 如果没有设置超时机制，那么不必要检测超时，那就会阻塞在 ecs.take() 方法上，
                       等待获取第一个执行结果
                 * 4. 如果所有的任务都执行失败，也就是说 future 都返回了，
                       但是 f.get() 抛出异常，那么从 active == 0 分支出去(感谢 newmicro 提出)
                         // 当然，这个需要看下面的 if 分支。
                 */
                // 有任务结束了
                if (f != null) {
                    --active;
                    try {
                        // 返回执行结果，如果有异常，都包装成 ExecutionException
                        return f.get();
                    } catch (ExecutionException eex) {
                        ee = eex;
                    } catch (RuntimeException rex) {
                        ee = new ExecutionException(rex);
                    }
                }
            }// 注意看 for 循环的范围，一直到这里
            if (ee == null)
                ee = new ExecutionException();
            throw ee;
        } finally {
            // 方法退出之前，取消其他的任务
            for (Future<T> f : futures)
                f.cancel(true);
        }
    }
```

- `List<Future<T>>  invokeAll(Collection<? extends Callable<T>> tasks)`: 执行所有的任务，返回任务结果

```
public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
        throws InterruptedException {
        if (tasks == null)
            throw new NullPointerException();
        List<Future<T>> futures = new ArrayList<Future<T>>(tasks.size());
        boolean done = false;
        try {
            // 这个很简单
            for (Callable<T> t : tasks) {
                // 包装成 FutureTask
                RunnableFuture<T> f = newTaskFor(t);
                futures.add(f);
                // 提交任务
                execute(f);
            }
            for (Future<T> f : futures) {
                if (!f.isDone()) {
                    try {
                        // 这是一个阻塞方法，直到获取到值，或抛出了异常
                        // 这里有个小细节，其实 get 方法签名上是会抛出 InterruptedException 的
                        // 可是这里没有进行处理，而是抛给外层去了。此异常发生于还没执行完的任务被取消了
                        f.get();
                    } catch (CancellationException ignore) {
                    } catch (ExecutionException ignore) {
                    }
                }
            }
            done = true;
            // 这个方法返回，不像其他的场景，返回 List<Future>，其实执行结果还没出来
            // 这个方法返回是真正的返回，任务都结束了
            return futures;
        } finally {
            // 为什么要这个？就是上面说的有异常的情况
            if (!done)
                for (Future<T> f : futures)
                    f.cancel(true);
        }
    }
```
> 至于 `List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)`： 带有是否超时的参数，
就是在每一次执行完任务后，都会去计算是否超时，如果超时就返回任务集合

#### 线程池核心方法

上面介绍了 AbstractExecutorService 抽象类的两个方法，具体的实现 execute() 就是交给线程池去执行，接下来分析线程池

-  构造方法： 构造线程池的参数，这都和执行 execute() 方法有关

   ```
    public ThreadPoolExecutor(int corePoolSize, // 核心线程池数
                                  int maximumPoolSize, // 最大线程池数
                                  long keepAliveTime, //  空闲线程的活跃时间
                                  TimeUnit unit, // keepAliveTime 的时间单位
                                  BlockingQueue<Runnable> workQueue, // 阻塞队列也是线程池的工作队列
                                  ThreadFactory threadFactory, // 用于生成线程
                                  RejectedExecutionHandler handler// 拒绝策略，用户自定义实现，默认是抛出异常) {
            if (corePoolSize < 0 ||
                maximumPoolSize <= 0 ||
                maximumPoolSize < corePoolSize ||
                keepAliveTime < 0)
                throw new IllegalArgumentException();
            if (workQueue == null || threadFactory == null || handler == null)
                throw new NullPointerException();
            this.acc = System.getSecurityManager() == null ?
                    null :
                    AccessController.getContext();
            this.corePoolSize = corePoolSize;
            this.maximumPoolSize = maximumPoolSize;
            this.workQueue = workQueue;
            this.keepAliveTime = unit.toNanos(keepAliveTime);
            this.threadFactory = threadFactory;
            this.handler = handler;
    }
   ``` 
   上述的构造方法中的参数，具体的含义分别解释下：
   - corePoolSize：核心线程池的大小，是工作队列活跃的最小值
   - maximumPoolSize：最大线程池数量
   - keepAliveTime：当线程空闲时间达到keepAliveTime时，线程会退出（关闭），直到线程数等于核心线程数；
   如果设置了allowCoreThreadTimeout=true，则线程会退出直到线程数等于零。
   - unit：keepAliveTime 的时间单位
   - workQueue：工作队列，用于在执行task之前保存task
   - threadFactory：构造线程的工厂，默认是 Executors.defaultThreadFactory()
   - handler：当达到了线程边界和队列容量，无法及时处理时，reject task使用的处理策略

- execute() 方法解析

    ```
    public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
    
        // 这个是表示 “线程池状态” 和 “线程数” 的整数，状态是前三位，线程数是后29位
        int c = ctl.get();
    
        // 如果当前线程数少于核心线程数，那么直接添加一个 worker 来执行任务，
        // 创建一个新的线程，并把当前任务 command 作为这个线程的第一个任(firstTask)
        if (workerCountOf(c) < corePoolSize) {
            // 添加任务成功，那么就结束了。提交任务嘛，线程池已经接受了这个任务，这个方法也就可以返回了
            // 至于执行的结果，到时候会包装到 FutureTask 中。
            // 返回 false 代表线程池不允许提交任务
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        // 到这里说明，要么当前线程数大于等于核心线程数，或者刚刚 addWorker 失败了
        // 如果线程池处于 RUNNING 状态，把这个任务添加到任务队列 workQueue 中
        if (isRunning(c) && workQueue.offer(command)) {
            /* 这里面说的是，如果任务进入了 workQueue，我们是否需要开启新的线程
             * 因为线程数在 [0, corePoolSize) 是无条件开启新的线程
             * 如果线程数已经大于等于 corePoolSize，那么将任务添加到队列中，然后进到这里
             */
            int recheck = ctl.get();
            // 如果线程池已不处于 RUNNING 状态，那么移除已经入队的这个任务，并且执行拒绝策略
            if (! isRunning(recheck) && remove(command))
                reject(command);
            // 如果线程池还是 RUNNING 的，并且线程数为 0，那么开启新的线程
            // 到这里，我们知道了，这块代码的真正意图是：担心任务提交到队列中了，但是线程都关闭了
            // addWorker(null, false)：提交的 command 为null，然后直接从队列头部获取任务执行
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        // 如果 workQueue 队列满了，那么进入到这个分支
        // 以 maximumPoolSize 为界创建新的 worker，
        // 如果失败，说明当前线程数已经达到 maximumPoolSize，执行拒绝策略
        else if (!addWorker(command, false))
            reject(command);
    }
    ```