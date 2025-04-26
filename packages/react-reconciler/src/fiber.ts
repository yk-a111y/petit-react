import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
// *tsconfig中配置的动态路径，因为不同宿主环境，Container的类型不一样
import { Container } from 'hostConfig';

export class FiberNode {
  // instance attr
  tag: WorkTag;
  key: Key;
  stateNode: any;
  type: any;
  ref: Ref;

  // fiber attr
  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  index: number;

  // working unit attr
  pendingProps: Props; // *当前fiber的props
  memoizedState: any; // *当前fiber的state，也存储FC的useHooks数组
  memoizedProps: Props | null; // *pendingProps处理后，赋值给memoizedProps
  alternate: FiberNode | null;

  // effects
  flags: Flags;
  subtreeFlags: Flags;
  updateQueue: unknown;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
    this.stateNode = null;
    this.type = null;
    this.ref = null;

    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.alternate = null;

    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.updateQueue = null;
  }
}

export class FiberRootNode {
  container: Container;
  current: FiberNode;
  finishedWork: FiberNode | null; // *保存已经完成整个递归流程的hostRootFiber

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;

    // *fiberRootNode 和 hostRootFiber 建立双向指针
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;

    this.finishedWork = null;
  }
}

export const createWorkInProgress = (
  current: FiberNode,
  pendingProps: Props
): FiberNode => {
  let wip = current.alternate;

  if (wip === null) {
    // mount,首屏渲染,创建全新的wip
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.stateNode = current.stateNode;

    wip.alternate = current;
    current.alternate = wip;
  } else {
    // update,更新已有的wip，并清除副作用
    wip.pendingProps = pendingProps;

    // clean up effects
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
  }

  wip.type = current.type;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;

  return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
  const { type, key, props } = element;
  let fiberTag: WorkTag = FunctionComponent;

  if (typeof type === 'string') {
    // <div>
    fiberTag = HostComponent;
  } else if (typeof type === 'function') {
    fiberTag = FunctionComponent;
  } else if (__DEV__) {
    console.warn('未实现的type类型', element);
  }

  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;

  return fiber;
}
