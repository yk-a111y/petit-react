import { ReactElement } from 'shared/ReactTypes';
import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue,
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

// *mount时调用的API => ReactDOM.createRoot(rootElement).render(<App />)

// *createRoot内部执行createContainer
export function createContainer(container: Container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(container, hostRootFiber);

  hostRootFiber.updateQueue = createUpdateQueue();

  return root;
}

// *render方法内部执行updateContainer, element为ReactElement | null
export function updateContainer(
  element: ReactElement | null,
  root: FiberRootNode
) {
  const hostRootFiber = root.current;
  console.log('🚀 ~ hostRootFiber:', hostRootFiber);
  const update = createUpdate<ReactElement | null>(element);

  enqueueUpdate(
    hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
    update
  );

  scheduleUpdateOnFiber(hostRootFiber);
}
