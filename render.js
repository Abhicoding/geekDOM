// let x = {
//   type: 'div',
//   props: {
//     id: '',
//     children: [{type: 'p', props:{ children:[{type: 'TEXT', props: {
//       nodeValue: `When you do it your way you can go anywhere you choose. 
//       Think about a cloud. Just float around and be there. Be so very light. 
//       Be a gentle whisper.`}}]}}, 
//     {type: 'TEXT', props: {nodeValue: 'Foo', children:[]}}]
//   }
// }

let previousState = null

function render (element, parentDOM) { //IN: newVnode, oldVnode, RealDOM OUT:
  const dom = document.createElement(element.type)
  
  // Attaching event listeners
  const isListener = listener => listener.startsWith('on')

  Object.keys(element.props).filter(value => isListener(value))
    .forEach(name => dom.addEventListener(name.slice(2).toLowerCase(), props[name]))

  // Adding the attributes
  Object.keys(element.props).filter(value => !isListener(value) && value !== 'children')
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

function reco (parentDOM, newVNode, oldVNode) { // IN oldNode, newNode, parent DOM; OUT dom, newVnode
  let dom
  newVNode.type === 'TEXT' 
    ? dom = document.createTextNode(newVNode.props.nodeValue)
    : dom = document.createElement(newVNode.type)
  
  dom = updateDOMProperties(dom, newVNode.props, oldVNode.props,)
  

}

function updateDOMProperties (dom, newProps, prevProps={}) {
  const isListener = listener => listener.startsWith('on')
  const tempObject = Object.assign({}, prevProps, newProps)
  let keys = Object.keys(tempObject).filter(x => x !== 'children')

  for (let x of keys) {
    if (x in newProps) {
      if (newProps[x] === prevProps[x]){
        continue
      }
      if (!isListener(x)) {
        dom.setAttribute(x, newProps[x])
        continue
      }
      dom.addEventListener(x.slice(2).toLowerCase(), newProps[x])
      continue
    }
    if (!isListener(x)) {
      dom.removeAttribute(x, prevProps[x])
      continue
    }
    dom.removeEventLister(x.slice(2).toLowerCase(), prevProps[x])
  }
  return dom  
}

module.exports = render
