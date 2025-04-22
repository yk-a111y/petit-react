// ReactDOM.createRoot(root).render(<App />)

import { ReactElementType } from 'shared/ReactTypes';
import { Container } from './hostConfig';
import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/fiberReconciler';

// *container 为<div id="root"></div>
export function createRoot(container: Container) {
  const root = createContainer(container);

  return {
    render(element: ReactElementType) {
      // *这里传递一个jsx方法处理的对象, updateContainer方法关联fiberRootNode和要渲染的内容
      updateContainer(element, root);
    },
  };
}
