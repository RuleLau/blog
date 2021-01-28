### ThreadPool - 分析-下

上一篇文章已经分析了线程池的核心方法，但是核心方法中的具体细节还没有分析，接下来就分析下

##### 具体执行

- `boolean addWorker(Runnable firstTask, boolean core)`：添加任务到队列中，如果添加成功后，执行任务。
参数 firstTask：可以为空，那么表示执行队列中的对头任务执行，否则根据核心数的条件判断是否新建线程执行还是加入队列
参数 core：是否使用核心线程数，如果是true，则根据 corePoolSize，否则使用 maximumPoolSize

```
   private boolean addWorker(Runnable firstTask, boolean core) {
       retry:
       for (;;) {
           int c = ctl.get();
           int rs = runStateOf(c);
   
           // 这个非常不好理解
           // 如果线程池已关闭，并满足以下条件之一，那么不创建新的 worker：
           // 1. 线程池状态大于 SHUTDOWN，其实也就是 STOP, TIDYING, 或 TERMINATED
           // 2. firstTask != null
           // 3. workQueue.isEmpty()
           // 简单分析下：
           // 还是状态控制的问题，当线程池处于 SHUTDOWN 的时候，不允许提交任务，但是已有的任务继续执行
           // 当状态大于 SHUTDOWN 时，不允许提交任务，且中断正在执行的任务
           // 多说一句：如果线程池处于 SHUTDOWN，但是 firstTask 为 null，且 workQueue 非空，那么是允许创建 worker 的
           // 这是因为 SHUTDOWN 的语义：不允许提交新的任务，但是要把已经进入到 workQueue 的任务执行完，
           // 所以在满足条件的基础上，是允许创建新的 Worker 的
           if (rs >= SHUTDOWN &&
               ! (rs == SHUTDOWN &&
                  firstTask == null &&
                  ! workQueue.isEmpty()))
               return false;
   
           for (;;) {
               int wc = workerCountOf(c);
               if (wc >= CAPACITY ||
                   wc >= (core ? corePoolSize : maximumPoolSize))
                   return false;
               // 如果成功，那么就是所有创建线程前的条件校验都满足了，准备创建线程执行任务了
               // 这里失败的话，说明有其他线程也在尝试往线程池中创建线程
               if (compareAndIncrementWorkerCount(c))
                   break retry;
               // 由于有并发，重新再读取一下 ctl
               c = ctl.get();
               // 正常如果是 CAS 失败的话，进到下一个里层的for循环就可以了 
               // 可是如果是因为其他线程的操作，导致线程池的状态发生了变更，如有其他线程关闭了这个线程池
               // 那么需要回到外层的for循环
               if (runStateOf(c) != rs)
                   continue retry;
               // else CAS failed due to workerCount change; retry inner loop
           }
       }
   
       /*
        * 到这里，我们认为在当前这个时刻，可以开始创建线程来执行任务了，
        * 因为该校验的都校验了，至于以后会发生什么，那是以后的事，至少当前是满足条件的
        */
       // worker 是否已经启动
       boolean workerStarted = false;
       // 是否已将这个 worker 添加到 workers 这个 HashSet 中
       boolean workerAdded = false;
       Worker w = null;
       try {
           final ReentrantLock mainLock = this.mainLock;
           // 把 firstTask 传给 worker 的构造方法
           w = new Worker(firstTask);
           // 取 worker 中的线程对象，之前说了，Worker的构造方法会调用 ThreadFactory 来创建一个新的线程
           final Thread t = w.thread;
           if (t != null) {
               // 这个是整个线程池的全局锁，持有这个锁才能让下面的操作“顺理成章”，
               // 因为关闭一个线程池需要这个锁，至少我持有锁的期间，线程池不会被关闭
               mainLock.lock();
               try {
                   int c = ctl.get();
                   int rs = runStateOf(c);
   
                   // 小于 SHUTTDOWN 那就是 RUNNING，这个自不必说，是最正常的情况
                   // 如果等于 SHUTDOWN，前面说了，不接受新的任务，但是会继续执行等待队列中的任务
                   if (rs < SHUTDOWN ||
                       (rs == SHUTDOWN && firstTask == null)) {
                       // worker 里面的 thread 可不能是已经启动的
                       if (t.isAlive())
                           throw new IllegalThreadStateException();
                       // 加到 workers 这个 HashSet 中
                       workers.add(w);
                       int s = workers.size();
                       // largestPoolSize 用于记录 workers 中的个数的最大值
                       // 因为 workers 是不断增加减少的，通过这个值可以知道线程池的大小曾经达到的最大值
                       if (s > largestPoolSize)
                           largestPoolSize = s;
                       workerAdded = true;
                   }
               } finally {
                   mainLock.unlock();
               }
               // 添加成功的话，启动这个线程
               if (workerAdded) {
                   // 启动线程
                   t.start();
                   workerStarted = true;
               }
           }
       } finally {
           // 如果线程没有启动，需要做一些清理工作，如前面 workCount 加了 1，将其减掉
           if (! workerStarted)
               addWorkerFailed(w);
       }
       // 返回线程是否启动成功
       return workerStarted;
   }
```
添加失败的话，会将加入workers 中的 worker 进行移除，可以看下面这个方法：`addWorkerFailed(Worker w)`

```
// workers 中删除掉相应的 worker
// workCount 减 1
private void addWorkerFailed(Worker w) {
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        if (w != null)
            workers.remove(w);
        decrementWorkerCount();
        // rechecks for termination, in case the existence of this worker was holding up termination
        tryTerminate();
    } finally {
        mainLock.unlock();
    }
}
```
添加成功的话，根据 `addWorker(Runnable firstTask, boolean core)` 中代码，就会执行 t.start(), start() 方法具体执行的逻辑就是
run() 方法中的，那么接下来继续看 worker.run() 方法

```
public void run() {
    // 执行的具体方法
   runWorker(this);
 }

final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    w.unlock(); // allow interrupts
    boolean completedAbruptly = true;
    try {
        // 任务不为空，或者 getTask() 不为空，
        // getTask() 就是 从 workQueue 队列中取出先入队的任务
        // 循环调用 getTask 获取任务 ，下面会详细将这块 getTask()
        while (task != null || (task = getTask()) != null) {
            w.lock();
             // 如果线程池状态大于等于 STOP，那么意味着该线程也要中断
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            try {
                // 这是一个钩子方法，留给需要的子类实现
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    // 执行任务
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    thrown = x; throw new Error(x);
                } finally {
                     // 也是一个钩子方法，将 task 和异常作为参数，留给需要的子类实现
                    afterExecute(task, thrown);
                }
            } finally {
                 // 置空 task，准备 getTask 获取下一个任务
                task = null;
                // 累加完成的任务数
                w.completedTasks++;
                // 释放掉 worker 的独占锁
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
         // 如果到这里，需要执行线程关闭：
        // 1. 说明 getTask 返回 null，也就是说，队列中已经没有任务需要执行了，执行关闭
        // 2. 任务执行过程中发生了异常
        // 第一种情况，已经在代码处理了将 workCount 减 1，这个在 getTask 方法分析中会说
        // 第二种情况，workCount 没有进行处理，所以需要在 processWorkerExit 中处理
        processWorkerExit(w, completedAbruptly);
    }
}
```

接下里看下 getTask() 怎么从阻塞队列中获取任务的
```
// 执行阻塞或定时等待任务，具体取决于当前配置设置，如果返回null，因为那么下列任何一个原因：
//1. 超过了maximumPoolSize 的 workers
//2. 线程池是停止的
//3. 线程池是关闭的或者队列是空的
//4.worker 执行任务超时了
private Runnable getTask() {
    boolean timedOut = false; // Did the last poll() time out?

    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);

        // 检查队列是否是空的，或者线程状态是错误的
        if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
            // CAS 减少一个 worker 数
            decrementWorkerCount();
            return null;
        }

        int wc = workerCountOf(c);

        //允许核心线程数内的线程回收，或当前线程数超过了核心线程数，那么有可能发生超时关闭
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;

        if ((wc > maximumPoolSize || (timed && timedOut))
            && (wc > 1 || workQueue.isEmpty())) {
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }
         // wc <= maximumPoolSize 同时没有超时
        try {
             // 到 workQueue 中获取任务
            Runnable r = timed ?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                workQueue.take();
            if (r != null)
                return r;
            timedOut = true;
        } catch (InterruptedException retry) {
            // 如果开发者将 maximumPoolSize 调小了，导致其小于当前的 workers 数量，
             // 那么意味着超出的部分线程要被关闭。重新进入 for 循环，自然会有部分线程会返回 null
            timedOut = false;
        }
    }
}
```

### 总结

- java 线程池有哪些关键属性？

> corePoolSize，maximumPoolSize，workQueue，keepAliveTime，rejectedExecutionHandler
  corePoolSize 到 maximumPoolSize 之间的线程会被回收，当然 corePoolSize 的线程也可以通过设置而得到回收（allowCoreThreadTimeOut(true)）。
  workQueue 用于存放任务，添加任务的时候，如果当前线程数超过了 corePoolSize，那么往该队列中插入任务，线程池中的线程会负责到队列中拉取任务。
  keepAliveTime 用于设置空闲时间，如果线程数超出了 corePoolSize，并且有些线程的空闲时间超过了这个值，会执行关闭这些线程的操作
  rejectedExecutionHandler 用于处理当线程池不能执行此任务时的情况，默认有抛出 RejectedExecutionException 异常、忽略任务、
  使用提交任务的线程来执行此任务和将队列中等待最久的任务删除，然后提交此任务这四种策略，默认为抛出异常。

- 说说线程池中的线程创建时机？

> - 如果当前线程数少于 corePoolSize，那么提交任务的时候创建一个新的线程，并由这个线程执行这个任务；
> - 如果当前线程数已经达到 corePoolSize，那么将提交的任务添加到队列中，等待线程池中的线程去队列中取任务；
> - 如果队列已满，那么创建新的线程来执行任务，需要保证池中的线程数不会超过 maximumPoolSize，如果此时线程数超过了 
>maximumPoolSize，那么执行拒绝策略。

> 注意：如果将队列设置为无界队列，那么线程数达到 corePoolSize 后，其实线程数就不会再增长了。
> 因为后面的任务直接往队列塞就行了，此时 maximumPoolSize 参数就没有什么意义。

- 任务执行过程中发生异常怎么处理？
> 如果某个任务执行出现异常，那么执行任务的线程会被关闭，而不是继续接收其他任务。然后会启动一个新的线程来代替它。

- 什么时候会执行拒绝策略？
> - workers 的数量达到了 corePoolSize（任务此时需要进入任务队列），任务入队成功，与此同时线程池被关闭了，而且关闭线程池并没有将这个任务出队，那么执行拒绝策略。这里说的是非常边界的问题，入队和关闭线程池并发执行，读者仔细看看 execute 方法是怎么进到第一个 reject(command) 里面的。
> - workers 的数量大于等于 corePoolSize，将任务加入到任务队列，可是队列满了，任务入队失败，那么准备开启新的线程，可是线程数已经达到 maximumPoolSize，那么执行拒绝策略。
