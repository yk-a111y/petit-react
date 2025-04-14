import { ReactElementType } from 'shared/ReactTypes';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { createFiberFromElement, FiberNode } from './fiber';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

// * mount阶段存在大量插入节点的操作，即Placement，故不追踪副作用；对根节点执行1次Placement即可
function childReconciler(shouldTrackSideEffects: boolean) {
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    // *根据element创建fiber
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;

    return fiber;
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;

    return fiber;
  }

  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackSideEffects && fiber.alternate === null) {
      fiber.flags |= Placement;
    }

    return fiber;
  }

  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild?: ReactElementType
  ) {
    // * 判断当前fiber的类型
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const fiber = placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );

          return fiber;
        default:
          if (__DEV__) {
            console.warn('未实现的reconcile类型:', newChild);
          }
          return null;
      }
    }

    // TODO 多节点情况 ul > li*3

    // * 文本节点情况 HostText
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const fiber = placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFirstChild, newChild)
      );

      return fiber;
    }

    if (__DEV__) {
      console.warn('未实现的reconcile类型:', newChild);
    }

    return null;
  };
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
