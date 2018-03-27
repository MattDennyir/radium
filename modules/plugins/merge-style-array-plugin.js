/* @flow */

import type {PluginConfig, PluginResult} from '.';

// Convenient syntax for multiple styles: `style={[style1, style2, etc]}`
// Ignores non-objects, so you can do `this.state.isCool && styles.cool`.
const mergeStyleArrayPlugin = function ({
  style,
  mergeStyles
}: PluginConfig): PluginResult {
  const newStyle = Array.isArray(style) ? mergeStyles(style) : style;
  return {style: newStyle};
};

module.exports = mergeStyleArrayPlugin;
