// 'use strict';
//
// var resolveStyles = require('./resolve-styles.js');
// var wrapUtils = require('./wrap-utils.js');
//
// var enhanceWithRadium = function (ComposedComponent) {
//   var RadiumEnhancer = function () {
//     ComposedComponent.prototype.constructor.call(this);
//
//     if (!this.state) {
//       this.state = {};
//     }
//
//     var radiumInitialState = wrapUtils.getInitialState();
//     Object.keys(radiumInitialState).forEach(function (key) {
//       this.state[key] = radiumInitialState[key];
//     }, this);
//   };
//
//   RadiumEnhancer.prototype = new ComposedComponent();
//   RadiumEnhancer.prototype.constructor = RadiumEnhancer;
//
//   RadiumEnhancer.prototype.render = function () {
//     var renderedElement = ComposedComponent.prototype.render.call(this);
//     return resolveStyles(this, renderedElement);
//   };
//
//   RadiumEnhancer.prototype.componentWillUnmount = function () {
//     if (ComposedComponent.prototype.componentWillUnmount) {
//       ComposedComponent.prototype.componentWillUnmount.call(this);
//     }
//
//     wrapUtils.componentWillUnmount(this);
//   };
//
//   RadiumEnhancer.defaultProps = ComposedComponent.defaultProps;
//   RadiumEnhancer.propTypes = ComposedComponent.propTypes;
//   RadiumEnhancer.contextTypes = ComposedComponent.contextTypes;
//
//   return RadiumEnhancer;
// };
//
// module.exports = enhanceWithRadium;

'use strict';

var resolveStyles = require('./resolve-styles.js');
var wrapUtils = require('./wrap-utils.js');
var assign = require('lodash/object/assign');

var enhanceWithRadium = function (ComposedComponent) {
  const displayName =
    ComposedComponent.displayName ||
    ComposedComponent.name ||
    'Component';

  class RadiumEnhancer extends ComposedComponent {

    constructor(props) {
      super(props);

      var radiumInitialState = wrapUtils.getInitialState();
      this.state = assign(this.state || {}, radiumInitialState);
    }

    render() {
      var renderedElement = super.render();
      return resolveStyles(this, renderedElement);
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      wrapUtils.componentWillUnmount(this);
    }
  };

  RadiumEnhancer.displayName = `Radium(${displayName})`;

  return RadiumEnhancer;
}

module.exports = enhanceWithRadium;
