import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostRoot, HostComponent, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFiber';

// *递归中的递，比较当前fiber和子fiber，返回fiberNode
// *只会标记结构变化相关的flag：移动 => Placement，删除 => ChildDeletion
// * <A><B></B></A> => 进入A的beginWork：对比B的current fiberNode与reactElement，生成B的fiberNode
export const beginWork = (wip: FiberNode) => {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      // text文本为叶子节点，递归递到这里结束，开始completeWork
      return null;
    default:
      if (__DEV__) {
        console.log('beginWork未实现的类型：', wip.tag);
      }
      return null;
  }
};

// * 计算最新状态 + 生成子fiber
function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memorizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<Element>;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;

  const { memoizedState } = processUpdateQueue(baseState, pending);
  wip.memorizedState = memoizedState;

  const nextChildren = wip.memoizedProps;
  reconcileChildren(wip, nextChildren);

  // * return children fiberNode
  return wip.child;
}

// * 仅生成子fiber
function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);

  // * return children fiberNode
  return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElement) {
  const current = wip.alternate;

  if (current !== null) {
    // update 
    wip.child = reconcileChildFibers(wip, current.child, children);
  } else {
    // mount
    wip.child = mountChildFibers(wip, null, children);
  }

}
