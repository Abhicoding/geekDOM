
let x = {
  type: 'div',
  props: {
    id: '',
    onClick: something()
  },
  children: [{type: 'p', props:{}, children:[]}, 
    {type: 'TEXT', props: {nodeValue: 'Foo'}, children:[]}]
}

function render (element, parentDOM) {
  const dom = document.createElement(element.type)
  // Attaching event listeners
  const isListener = listener => listener.startsWith('on')

  Object.keys(element.props).filter(value => isListener(value))
    .forEach(name => element.addEventListener(name.slice(2).toLowerCase(), props[name]))

  // Adding the attributes
  Object.keys(element.props).filter(value => !isListener(value))
    .forEach(name => dom.setAttribute(name, element.props[name]))

  // Recursively appending child elements to the parent node
  if (element.children.length > 0) {
    element.children.forEach(child => {
      if (child.type === 'TEXT') {    // Adding text nodes
        const text = document.createTextNode(child.props.nodeValue)
        return dom.appendChild(text) 
      }  
      render(child, dom)
    })
  }
  return parentDOM.appendChild(dom)
}