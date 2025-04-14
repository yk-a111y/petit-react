import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { HostRoot } from './workTags';
import { MutationMask, NoFlags } from './fiberFlags';
import { commitMutationEffects } from './commitWork';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {});
}

// *调度功能
export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // *get fiberRootNode
  const root = markUpdateFromFiberToRoot(fiber);
  renderRoot(root);
}

// *从当前fiber向上找到fiberRootNode
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  if (node.tag === HostRoot) {
    return node.stateNode;
  }

  return null;
}

export function renderRoot(root: FiberRootNode) {
  // *init
  prepareFreshStack(root);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      if (__DEV__) {
        console.log('workLoop error: ', e);
      }
      workInProgress = null;
    }
  } while (true);

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  // *获取wip的fiberNode树中的flags，执行副作用
  commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;

  if (finishedWork === null) {
    return;
  }

  if (__DEV__) {
    console.warn('commit阶段开始', finishedWork);
  }

  // *reset
  root.finishedWork = null;

  // *判断是否存在副作用
  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  // *3 sub-phase
  if (subtreeHasEffect || rootHasEffect) {
    // *before mutation
    // *mutation => Placement
    commitMutationEffects(finishedWork);
    root.current = finishedWork; // 改变current fiber树的指向，至finishedWork fiber树（即WIP树）
    // *layout
  } else {
    root.current = finishedWork; // 没有更新，也需要改变fiber树指向
  }
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber);
  fiber.memoizedProps = fiber.pendingProps; // *将pendingProps赋值给memoizedProps

  // *next 为null，则证明无子节点，开始遍历兄弟节点（归）
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    // *next有值，即next为fiber的子节点，继续向下递
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;

  do {
    completeWork(node);
    const sibling = node.sibling;

    // *有兄弟节点，则继续处理兄弟节点
    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }

    // *没有兄弟节点，则返回到父节点
    node = node.return;

    // ! 这里需要将workInProgress指向父节点，否则会陷入死循环
    workInProgress = node;
  } while (node !== null);
}
