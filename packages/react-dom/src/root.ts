// ReactDOM.createRoot(root).render(<App />)
import { ReactElement } from 'shared/ReactTypes';
import { Container } from './hostConfig';
import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/fiberReconciler';

export function createRoot(container: Container) {
  const root = createContainer(container);

  return {
    render(element: ReactElement) {
      updateContainer(element, root);
    },
  };
}
