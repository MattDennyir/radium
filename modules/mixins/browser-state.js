var BrowserStateMixin = {
  getInitialState: function () {
    return {
      hover: false,
      focus: false,
      active: false
    };
  },

  getBrowserStateEvents: function () {
    return {
      onMouseEnter: this.radiumMouseEnter,
      onMouseLeave: this.radiumMouseLeave,
      onMouseDown: this.radiumMouseDown,
      onMouseUp: this.radiumMouseUp,
      onFocus: this.radiumFocus,
      onBlur: this.radiumBlur
    };
  },

  _callRadiumHandler: function (handler, ev) {
    var currentHandler = this.props[handler];

    if (currentHandler) {
      currentHandler(ev);
    }
  },

  radiumMouseEnter: function (ev) {
    this._callRadiumHandler("onMouseEnter", ev);

    this.setState({
      hover: true
    });
  },

  radiumMouseLeave: function (ev) {
    this._callRadiumHandler("onMouseLeave", ev);

    this.setState({
      hover: false,
      active: false
    });
  },

  radiumMouseDown: function (ev) {
    this._callRadiumHandler("onMouseDown", ev);

    this.setState({
      active: true
    });
  },

  radiumMouseUp: function (ev) {
    this._callRadiumHandler("onMouseUp", ev);

    this.setState({
      active: false
    });
  },

  radiumFocus: function (ev) {
    this._callRadiumHandler("onFocus", ev);

    this.setState({
      focus: true
    });
  },

  radiumBlur: function (ev) {
    this._callRadiumHandler("onBlur", ev);

    this.setState({
      focus: false
    });
  }
};

module.exports = BrowserStateMixin;
