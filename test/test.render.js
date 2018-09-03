'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rootInstance = null;

function render(element, container) {
  var prevInst = rootInstance;
  var nextInst = reco(container, element, prevInst);
  rootInstance = nextInst;
}

function reco(parentDOM, element, prevInst) {
  if (prevInst === null) {
    var newInstance = instantiate(element);
    parentDOM.appendChild(newInstance.dom);
    return newInstance;
  }
  if (!element) {
    parentDOM.removeChild(prevInst.dom);
    return null;
  }
  if (prevInst.element.type !== element.type) {
    var _newInstance = instantiate(element);
    parentDOM.replaceChild(_newInstance.dom, prevInst.dom);
    return _newInstance;
  }
  if (typeof element.type === 'string') {
    updateDOMProperties(prevInst.dom, element.props, prevInst.props, false);
    prevInst.childInstances = recoChildren(element, prevInst);
    prevInst.element = element;
    return prevInst;
  }
  prevInst.publicInstance.props = element.props;
  console.log(prevInst.publicInstance, '***prevInst***');
  var childElement = prevInst.publicInstance.render ? prevInst.publicInstance.render() : prevInst.element;
  var oldChildInstance = prevInst.childInstance;
  var childInstance = reco(parentDOM, childElement, oldChildInstance);
  prevInst.dom = childInstance.dom;
  prevInst.childInstance = childInstance;
  prevInst.element = element;
  return prevInst;
}

function instantiate(element) {
  // IN element, parent DOM; OUT dom, newVnode
  if (typeof element.type === 'string') {
    var _dom = element.type === 'TEXT' ? _dom = document.createTextNode(element.props.nodeValue) : _dom = document.createElement(element.type);
    updateDOMProperties(_dom, element.props, {}, false);
    var childInstances = element.props.children.map(instantiate);
    var childDOMS = childInstances.map(function (child) {
      return child.dom;
    });
    childDOMS.forEach(function (child) {
      return _dom.appendChild(child);
    });
    return { dom: _dom, element: element, childInstances: childInstances };
  }
  var instance = {};
  var publicInstance = componentInstance(element, instance);
  var childElement = publicInstance.render ? publicInstance.render() : publicInstance;
  var childInstance = instantiate(childElement);
  var dom = childInstance.dom;
  Object.assign(instance, { dom: dom, element: element, childInstance: childInstance, publicInstance: publicInstance });
  return instance;
}

function updateDOMProperties(dom, newProps) {
  var prevProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var newElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var isListener = function isListener(listener) {
    return listener.startsWith('on');
  };
  var tempObject = Object.assign({}, prevProps, newProps);
  var keys = Object.keys(tempObject).filter(function (x) {
    return x !== 'children';
  }); //May be you are not updating node value
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var x = _step.value;

      if (x in newProps) {
        if (newProps[x] === prevProps[x] && !newElement) {
          continue;
        }
        if (x === 'nodeValue') {
          dom.textContent = newProps[x];
          continue;
        }
        if (!isListener(x)) {
          dom.setAttribute(x, newProps[x]);
          continue;
        }
        dom.addEventListener(x.slice(2).toLowerCase(), newProps[x]);
        continue;
      }
      if (x === 'nodeValue') {
        dom.textContent = '';
        continue;
      }
      if (!isListener(x)) {
        dom.removeAttribute(x, prevProps[x]);
        continue;
      }
      dom.removeEventLister(x.slice(2).toLowerCase(), prevProps[x]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function recoChildren(element, previousInstance) {
  var dom = previousInstance.dom;
  var previousChildInstances = previousInstance.childInstances;
  var newChildren = element.props.children; // This is passing undefined
  var newChildInstances = [];
  for (var i = 0, j = Math.max(newChildren.length, previousChildInstances.length); i < j; i++) {
    newChildInstances.push(reco(dom, newChildren[i], previousChildInstances[i]));
  }
  return newChildInstances.filter(function (child) {
    return child !== null;
  });
}

var Component = function () {
  function Component(props) {
    _classCallCheck(this, Component);

    this.props = props;
    this.state = this.state || {};
  }

  _createClass(Component, [{
    key: 'setState',
    value: function setState(update) {
      this.state = Object.assign({}, this.state, update);
      this.updateInstance(this._internalInstance);
    }
  }, {
    key: 'updateInstance',
    value: function updateInstance(internalInstance) {
      var parentDOM = internalInstance.dom.parentNode;
      var element = internalInstance.element;
      reco(parentDOM, element, internalInstance);
    }
  }]);

  return Component;
}();

function componentInstance(element, internalInstance) {
  var type = element.type,
      props = element.props;

  var publicInstance = new type(props);
  publicInstance._internalInstance = internalInstance;
  return publicInstance;
}

function h(element, props) {
  var vdom = { type: element };
  props !== null ? vdom.props = props : vdom.props = {};
  vdom.props.children = [];

  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  if (args.length == 0) {
    return vdom;
  }
  vdom = addChildtoVdom(vdom, args);
  return vdom;
}

function addChildtoVdom(vDom, childArray) {
  childArray.forEach(function (child) {
    if (isTextNode(child)) {
      return vDom.props.children.push(createTextNode(child));
    }
    if (Array.isArray(child)) {
      return addChildtoVdom(vDom, child);
    }
    return vDom.props.children.push(child);
  });
  return vDom;
}

function isTextNode(node) {
  return !(node instanceof Object);
}

function createTextNode(value) {
  return { type: 'TEXT', props: { nodeValue: value, children: [] } };
}

// @jsx h

var Test = function (_Component) {
  _inherits(Test, _Component);

  function Test() {
    _classCallCheck(this, Test);

    return _possibleConstructorReturn(this, (Test.__proto__ || Object.getPrototypeOf(Test)).apply(this, arguments));
  }

  _createClass(Test, [{
    key: 'render',
    value: function render() {
      return h(
        'div',
        null,
        h(Head, null),
        h(Body, null)
      );
    }
  }]);

  return Test;
}(Component);

var Head = function Head() {
  return h(
    'div',
    null,
    h(
      'h1',
      null,
      'Test component'
    )
  );
};

var Body = function (_Component2) {
  _inherits(Body, _Component2);

  function Body() {
    _classCallCheck(this, Body);

    var _this2 = _possibleConstructorReturn(this, (Body.__proto__ || Object.getPrototypeOf(Body)).call(this));

    _this2.state = {
      count: 0,
      toggle: false
    };
    _this2.increase = _this2.increase.bind(_this2);
    return _this2;
  }

  _createClass(Body, [{
    key: 'increase',
    value: function increase() {
      this.setState({
        count: this.state.count + 1,
        toggle: !this.state.toggle
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return h(
        'div',
        null,
        h(
          'p',
          null,
          this.state.count
        ),
        this.state.toggle ? h(
          'h1',
          null,
          'Hello'
        ) : h(
          'h2',
          null,
          'World'
        ),
        h(Button, { increase: this.increase, value: 'Increase' })
      );
    }
  }]);

  return Body;
}(Component);

var Button = function Button(_ref) {
  var increase = _ref.increase,
      value = _ref.value;

  return h(
    'div',
    { onClick: increase },
    value
  );
};

// console.log(Button, '***logging at the bottom***')

render(h(Test, null), document.getElementById('root'));
