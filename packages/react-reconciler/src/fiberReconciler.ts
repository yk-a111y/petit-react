import { ReactElementType } from 'shared/ReactTypes';
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
  const hostRootFiber = new FiberNode(HostRoot, {}, null); // init hostRootFiber
  const root = new FiberRootNode(container, hostRootFiber); // init fiberRootNode，并建立与hostRootFiber的关联

  hostRootFiber.updateQueue = createUpdateQueue();

  return root;
}

// *render方法内部执行updateContainer, element为ReactElement | null
export function updateContainer(
  element: ReactElementType | null,
  root: FiberRootNode
) {
  const hostRootFiber = root.current;

  const update = createUpdate<ReactElementType | null>(element);

  enqueueUpdate(
    hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
    update
  );

  scheduleUpdateOnFiber(hostRootFiber);
}
