### ThreadPool 

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
    
    - T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)
      
      只有其中的一个任务结束了，就可以返回，返回执行完的那个任务的结果
    - List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)
  
      执行所有任务，返回 Future 类型的一个 list
    - Future<T> submit(Runnable task, T result);
    
      提交一个 Runnable 任务，第二个参数将会放到 Future 中，作为返回值
    - boolean awaitTermination(long timeout, TimeUnit unit)
    - boolean isShutdown();
    
      线程池是否已关闭
    - List<Runnable> shutdownNow();
    
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

- RunnableFuture<T> newTaskFor(Runnable runnable, T value)：RunnableFuture 是用于获取执行结果的，我们常用它的子类 FutureTask
- RunnableFuture<T> newTaskFor(Callable<T> callable)： 这两个 newTaskFor 方法用于将我们的任务包装成 FutureTask 提交到线程池中执行