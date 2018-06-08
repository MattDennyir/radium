/** @flow */

import type {MatchMediaType} from '../config';
import type {PluginConfig, PluginResult} from './index';

import appendImportantToEachValue from '../append-important-to-each-value';
import hash from '../hash';

let _windowMatchMedia;
function _getWindowMatchMedia(ExecutionEnvironment) {
  if (_windowMatchMedia === undefined) {
    _windowMatchMedia = !!ExecutionEnvironment.canUseDOM &&
      !!window &&
      !!window.matchMedia &&
      (mediaQueryString => window.matchMedia(mediaQueryString)) ||
      null;
  }
  return _windowMatchMedia;
}

function _filterObject(
  obj: Object,
  predicate: (value: any, key: string) => bool
): Object {
  return Object.keys(obj)
    .filter(key => predicate(obj[key], key))
    .reduce(
      (result, key) => {
        result[key] = obj[key];
        return result;
      },
      {}
    );
}

function _removeMediaQueries(style) {
  return Object.keys(style).reduce(
    (styleWithoutMedia, key) => {
      if (key.indexOf('@media') !== 0) {
        styleWithoutMedia[key] = style[key];
      }
      return styleWithoutMedia;
    },
    {}
  );
}

function _topLevelRulesToCSS({
  addCSS,
  cssRuleSetToString,
  isNestedStyle,
  style,
  userAgent
}) {
  let className = '';
  Object.keys(style)
  .filter(name => name.indexOf('@media') === 0)
  .map(query => {
    const topLevelRules = appendImportantToEachValue(
      _filterObject(
        style[query],
        value => !isNestedStyle(value),
      )
    );

    if (!Object.keys(topLevelRules).length) {
      return;
    }

    const ruleCSS = cssRuleSetToString(
      '',
      topLevelRules,
      userAgent
    );

    const mediaQueryClassName = hash(ruleCSS);
    const css = query + '{ .' + mediaQueryClassName + ruleCSS + '}';

    addCSS(css);


    className += ' ' + mediaQueryClassName;
  });
  return className;
}

function _subscribeToMediaQuery({
  listener,
  listenersByQuery,
  matchMedia,
  mediaQueryListsByQuery,
  query
}) {
  query = query.replace('@media ', '');

  let mql = mediaQueryListsByQuery[query];
  if (!mql && matchMedia) {
    mediaQueryListsByQuery[query] = mql = matchMedia(query);
  }

  if (!listenersByQuery || !listenersByQuery[query]) {
    mql.addListener(listener);

    listenersByQuery[query] = {
      remove() {
        mql.removeListener(listener);
      }
    };
  }
  return mql;
}


export default function resolveMediaQueries({
  ExecutionEnvironment,
  addCSS,
  config,
  cssRuleSetToString,
  getComponentField,
  getGlobalState,
  isNestedStyle,
  mergeStyles,
  props,
  setState,
  style
}: PluginConfig): PluginResult { // eslint-disable-line no-shadow
  let newStyle = _removeMediaQueries(style);
  const mediaQueryClassNames = _topLevelRulesToCSS({
    addCSS,
    cssRuleSetToString,
    isNestedStyle,
    style,
    userAgent: config.userAgent
  });

  const newProps = {
    className: mediaQueryClassNames + ' ' + (props.className || '')
  };

  const matchMedia: ?MatchMediaType = config.matchMedia ||
    _getWindowMatchMedia(ExecutionEnvironment);

  if (!matchMedia) {
    return {
      props: newProps,
      style: newStyle
    };
  }

  const listenersByQuery = {
    ...getComponentField('_radiumMediaQueryListenersByQuery')
  };
  const mediaQueryListsByQuery =
    getGlobalState('mediaQueryListsByQuery') || {};

  Object.keys(style)
  .filter(name => name.indexOf('@media') === 0)
  .map(query => {
    const nestedRules = _filterObject(style[query], isNestedStyle);

    if (!Object.keys(nestedRules).length) {
      return;
    }

    const mql = _subscribeToMediaQuery({
      listener: () => setState(query, mql.matches, '_all'),
      listenersByQuery,
      matchMedia,
      mediaQueryListsByQuery,
      query
    });

    // Apply media query states
    if (mql.matches) {
      newStyle = mergeStyles([newStyle, nestedRules]);
    }
  });

  return {
    componentFields: {
      _radiumMediaQueryListenersByQuery: listenersByQuery
    },
    globalState: {mediaQueryListsByQuery},
    props: newProps,
    style: newStyle
  };
}
