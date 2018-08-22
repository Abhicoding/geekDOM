
let x = {
  type: 'div',
  props: {
    id: '',
    children: [{type: 'p', props:{ children:[{type: 'TEXT', props: {
      nodeValue: `When you do it your way you can go anywhere you choose. 
      Think about a cloud. Just float around and be there. Be so very light. 
      Be a gentle whisper. We tell people sometimes: we're like drug dealers, 
      come into town and get everybody absolutely addicted to painting. 
      It doesn't take much to get you addicted.`}}]}}, 
    {type: 'TEXT', props: {nodeValue: 'Foo', children:[]}}]
  }
}

function render (element, parentDOM) {
  const dom = document.createElement(element.type)
  
  // Attaching event listeners
  const isListener = listener => listener.startsWith('on')

  Object.keys(element.props).filter(value => isListener(value))
    .forEach(name => dom.addEventListener(name.slice(2).toLowerCase(), props[name]))

  // Adding the attributes
  Object.keys(element.props).filter(value => !isListener(value))
    .forEach(name => dom.setAttribute(name, element.props[name]))

  // Recursively appending child elements to the parent node
  if (element.props.children && element.props.children.length > 0) {
    element.props.children.forEach(child => {
      if (child.type === 'TEXT') {    // Adding text nodes
        const text = document.createTextNode(child.props.nodeValue)
        return dom.appendChild(text) 
      }  
      render(child, dom)
    })
  }
  return parentDOM.appendChild(dom)
}

module.exports = render
