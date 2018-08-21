
let x = {
  type: 'div',
  props: {
    id: '',
    onClick: something()
  },
  children: [{type: 'p'}]
}

function render (element, parentDOM) {
  const dom = document.createElement(element.type)
  // Attaching event listeners
  const isListener = listener => listener.startsWith('on')

  element.props.filter(value => isListener(value))
    .forEach(name => dom.addEventListener(name.slice(2).toLowerCase(), props[name]))

  // Adding the attributes

  element.props.filter(value => !isListener(value))
    .forEach(name => dom.setAttribute(name, props[name]))

  // Recursively appending Child elements to the parent node
  if (element.children.length > 0) {
    element.children.forEach(child => render(child, dom))
  }
  parentDOM.appendChild(dom)
}