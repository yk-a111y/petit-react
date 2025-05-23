import { Action } from 'shared/ReactTypes';

export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

export const createUpdate = <State>(action: Action<State>) => {
  return {
    action,
  };
};

// * 创建updateQueue
export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null,
    },
  } as UpdateQueue<State>;
};

// * 入队
export const enqueueUpdate = <State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
) => {
  updateQueue.shared.pending = update;
};

// * 消费updateQueue中的update
export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): {
  memoizedState: State;
} => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;

    // 防止循环引用
    if (action === baseState) {
      return result;
    }

    // 防止重复处理
    if (action && typeof action === 'object' && (action as any).__processed) {
      return result;
    }

    if (action instanceof Function) {
      // baseState 1 update (x) => 4x -> memoizedState = 4
      result.memoizedState = action(baseState);
    } else {
      // baseState 1 update 2 -> memoizedState = 2
      result.memoizedState = action;

      // 标记已处理
      if (result.memoizedState && typeof result.memoizedState === 'object') {
        (result.memoizedState as any).__processed = true;
      }
    }
  }

  return result;
};
