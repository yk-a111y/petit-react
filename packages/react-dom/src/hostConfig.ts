export type Container = Element;
export type Instance = Element;

export const createInstance = (type: string, props: any): Instance => {
  console.log('🚀 ~ createInstance ~ props:', props);
  // TODO: 处理props
  const instance = document.createElement(type);
  return instance;
};

export const appendInitialChild = (
  parent: Instance | Container,
  child: Instance
) => {
  parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
  return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;
