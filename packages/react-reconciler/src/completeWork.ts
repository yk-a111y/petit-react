import { FiberNode } from './fiber';
import {
  Container,
  createInstance,
  createTextInstance,
  appendInitialChild,
} from 'hostConfig';
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from './workTags';
import { NoFlags } from './fiberFlags';

// *递归中的归，收集effect list
export const completeWork = (wip: FiberNode) => {
  const newProps = wip.pendingProps;
  const current = wip.alternate;

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // *update
      } else {
        //*1. 构建DOM
        const instance = createInstance(wip.type, newProps);
        //*2. 将DOM插入到DOM树中
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        // *update
      } else {
        //*1. 构建DOM
        const instance = createTextInstance(newProps.content);
        //*2. 将DOM插入到DOM树中
        // appendAllChildren(instance, wip); 无需执行，因为HostText已经是叶子节点了
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
      bubbleProperties(wip);
      return null;
    case FunctionComponent:
      bubbleProperties(wip);
      return null;
    default:
      if (__DEV__) {
        console.warn('未处理的completeWork情况', wip);
      }

      break;
  }
};

function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node?.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === wip) {
      return;
    }

    // *递归中的归
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    // *当前subtreeFlags 包含了当前节点和其子节点的subtreeFlags
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child.return = wip;
    child = child.sibling;
  }

  // *将subtreeFlags赋值给wip树
  wip.subtreeFlags |= subtreeFlags;
}
