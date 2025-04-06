import { ReactElement } from "shared/ReactTypes";
import { FiberNode } from "./fiber";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

// * mount阶段存在大量插入节点的操作，即Placement，故不追踪副作用；对根节点执行1次Placement即可
function childReconciler(shouldTrackSideEffects: boolean) {
  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild?: ReactElement
  ) {
    // * 判断当前fiber的类型
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return reconcileSingleElement(returnFiber, currentFirstChild, newChild);
        default:
          if (__DEV__) {
            console.log('未实现的reconcile类型：', newChild);
          }
          return null;
      }
    }

    // * 多节点情况 ul > li*3

    // * 文本节点情况 HostText
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return reconcileSingleTextNode(returnFiber, currentFirstChild, newChild);
    }

    if (__DEV__) {
      console.log('未实现的reconcile类型：', newChild);
    }

    return null;
  }
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);