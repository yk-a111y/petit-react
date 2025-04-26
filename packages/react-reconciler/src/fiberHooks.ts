import internals from 'shared/internals';
import { FiberNode } from './fiber';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

const { currentDispatcher } = internals;
interface Hook {
  memoizedState: any; // * 保存Hoos自身的状态，区分Fiber的memoizedState
  next: Hook | null; // * 指向下一个Hook
  updateQueue: unknown; // * 存储更新状态
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
  }


  const Component = wip.type;
  const props = wip.pendingProps;
  const children = Component(props);

  // * 重置操作
  currentlyRenderingFiber = null;

  return children;
}
