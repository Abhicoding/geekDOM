
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

  dom.props.filter(value => isListener(value))
    .forEach(name => dom.addEventListener(name.slice(2).toLowerCase(), props[name]))

  // Adding the attributes
  dom.props.filter(value => !isListener(value))
    .forEach(name => dom.setAttribute(name, props[name]))

  // Recursively appending child elements to the parent node
  if (element.children.length > 0) {
    element.children.forEach(child => {
      if (child.type === 'TEXT') {    // Adding text nodes
        const text = document.createTextNode(child.props.nodeValue)
        return element.appendChild(text) 
      }  
      render(child, dom)
    })
  }
  parentDOM.appendChild(dom)
}