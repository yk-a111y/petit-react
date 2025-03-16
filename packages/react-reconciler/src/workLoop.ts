import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { HostRoot } from './workTags';

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
  // init
  prepareFreshStack(root);

  do {
    try {
      workLoop();
    } catch (e) {
      console.log('workLoop error: ', e);
      workInProgress = null;
    }
  } while (true);
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber);
  fiber.memoizedProps = fiber.pendingProps;

  // next 为null，则证明无子节点，开始遍历兄弟节点
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    // next有值，则继续执行next指针指向的fiberNode
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;
  do {
    completeWork(node);
    const sibling = node.sibling;

    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }
    node = node.return;
  } while (node !== null);
}
