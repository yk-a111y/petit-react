import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ElementType, Key, Props, Ref } from 'shared/ReactTypes';

const ReactElement = function (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: Props
) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'petit_react',
  };

  return element;
};

export const jsx = (
  type: ElementType,
  config: any,
  ...maybeChildren: any[]
) => {
  let key: Key = null;
  let ref: Ref = null;
  const props: Props = {};

  for (const prop in config) {
    const val = config[prop];
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val;
      }
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val;
      }
    }

    // *安全调用，防止config由Object.create(null)创建，无原型链导致报错
    // *只复制属于config对象自身的属性到props对象中
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }

  const maybeChildrenLength = maybeChildren.length;
  if (maybeChildrenLength === 1) {
    props.children = maybeChildren[0];
  } else if (maybeChildrenLength > 1) {
    props.children = maybeChildren;
  }

  return ReactElement(type, key, ref, props);
};

export const jsxDEV =  (
  type: ElementType,
  config: any,
) => {
  let key: Key = null;
  let ref: Ref = null;
  const props: Props = {};

  for (const prop in config) {
    const val = config[prop];
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val;
      }
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val;
      }
    }

    // *安全调用，防止config由Object.create(null)创建，无原型链导致报错
    // *只复制属于config对象自身的属性到props对象中
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }

  return ReactElement(type, key, ref, props);
};;
