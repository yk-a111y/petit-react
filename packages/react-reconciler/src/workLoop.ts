import { FiberNode } from './fiber';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
  workInProgress = fiber;
}

export function renderRoot(root: FiberNode) {
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
