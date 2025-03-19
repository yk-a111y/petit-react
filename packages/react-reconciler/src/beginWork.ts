import { FiberNode } from './fiber';

// *递归中的递，比较当前fiber和子fiber，返回fiberNode
// *只会标记结构变化相关的flag：移动 => Placement，删除 => ChildDeletion
export const beginWork = (fiber: FiberNode) => {
  return null;
};
