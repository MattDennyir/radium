/** @flow */

import type {MatchMediaType} from '../config';
import type {PluginConfig, PluginResult} from './index';

let _windowMatchMedia;
const _getWindowMatchMedia = function(ExecutionEnvironment) {
  if (_windowMatchMedia === undefined) {
    _windowMatchMedia = !!ExecutionEnvironment.canUseDOM &&
      !!window &&
      !!window.matchMedia &&
      (mediaQueryString => window.matchMedia(mediaQueryString)) ||
      null;
  }
  return _windowMatchMedia;
};

export default function resolveMediaQueries({
  ExecutionEnvironment,
  getComponentField,
  getGlobalState,
  config,
  mergeStyles,
  setState,
  style
}: PluginConfig): PluginResult { // eslint-disable-line no-shadow
  // Remove media queries
  let newStyle = Object.keys(style).reduce(
    (styleWithoutMedia, key) => {
      if (key.indexOf('@media') !== 0) {
        styleWithoutMedia[key] = style[key];
      }
      return styleWithoutMedia;
    },
    {}
  );

  const matchMedia: ?MatchMediaType = config.matchMedia ||
    _getWindowMatchMedia(ExecutionEnvironment);

  if (!matchMedia) {
    return newStyle;
  }

  const newComponentFields = {};
  const mediaQueryListByQueryString =
    getGlobalState('mediaQueryListByQueryString') || {};

  Object.keys(style)
  .filter(name => name.indexOf('@media') === 0)
  .map(query => {
    const mediaQueryStyles = style[query];
    query = query.replace('@media ', '');

    // Create a global MediaQueryList if one doesn't already exist
    let mql = mediaQueryListByQueryString[query];
    if (!mql && matchMedia) {
      mediaQueryListByQueryString[query] = mql = matchMedia(query);
    }

    const listenersByQuery =
      getComponentField('_radiumMediaQueryListenersByQuery');

    if (!listenersByQuery || !listenersByQuery[query]) {
      const listener = () => setState(query, mql.matches, '_all');
      mql.addListener(listener);
      newComponentFields._radiumMediaQueryListenersByQuery = {
        ...listenersByQuery
      };
      newComponentFields._radiumMediaQueryListenersByQuery[query] = {
        remove() { mql.removeListener(listener); }
      };
    }

    // Apply media query states
    if (mql.matches) {
      newStyle = mergeStyles([newStyle, mediaQueryStyles]);
    }
  });

  // Remove media queries
  newStyle = Object.keys(newStyle).reduce(
    (styleWithoutMedia, key) => {
      if (key.indexOf('@media') !== 0) {
        styleWithoutMedia[key] = newStyle[key];
      }
      return styleWithoutMedia;
    },
    {}
  );

  return {
    componentFields: newComponentFields,
    globalState: {mediaQueryListByQueryString},
    style: newStyle
  };
}
