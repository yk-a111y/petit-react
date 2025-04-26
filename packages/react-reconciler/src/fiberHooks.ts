import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { createUpdate, enqueueUpdate, createUpdateQueue, UpdateQueue } from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

const { currentDispatcher } = internals;
interface Hook {
  memoizedState: any; // * 保存Hoos自身的状态，区分Fiber的memoizedState
  next: Hook | null; // * 指向下一个Hook
  updateQueue: UpdateQueue<any> | null; // * 存储更新状态
}

export function renderWithHooks(wip: FiberNode) {
  // * 赋值操作
  currentlyRenderingFiber = wip;
  wip.memoizedState = null;

  const current = wip.alternate;
  if (current !== null) {
    // * update
    workInProgressHook = current.memoizedState;
  } else {
    // * mount
    workInProgressHook = null;
    currentDispatcher.current = HooksDispatcherOnMount;
  }


  const Component = wip.type;
  const props = wip.pendingProps;
  const children = Component(props);

  // * 重置操作
  currentlyRenderingFiber = null;

  return children;
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

function mountState<State>(initialState: (() => State) | State): [State, Dispatch<State>] {
  // * 找到当前useState对应的hook数据
  const hook = mountWorkInProgressHook();

  let memoizedState: State;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }

  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;
  hook.memoizedState = memoizedState;

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber!, queue);
  queue.dispatch = dispatch;

  return [memoizedState, dispatch]
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  const update = createUpdate(action);
  enqueueUpdate(updateQueue, update);

  scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    next: null,
    updateQueue: null
  }

  // * mount时的第一个hook
  if (workInProgressHook === null) {
    // * 如果当前fiber为null，证明没有在FC内执行hook
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件中使用hook');
    } else {
      workInProgressHook = hook;
      currentlyRenderingFiber.memoizedState = workInProgressHook;
    }
  } else {
    // * mount时的后续Hook，构建Hook单向链表
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }

  return workInProgressHook;
}