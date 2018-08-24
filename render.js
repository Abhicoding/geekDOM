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

let previousInstance = null

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

function render () {

}

function reco (parentDOM, element, prevInst) {
  if (prevInst === null) {
    const newInstance = instantiate(element)
    parentDOM.appendChild(newInstance.dom)
    return newInstance
  }
  if (prevInst.element.type === element.type) {
    updateDOMProperties(prevInst.dom, element.props, prevInst.props, false)
    prevInst.childInstances = recoChildren (element, prevInst)
    prevInst.element = element
    return prevInst
  }
  const newInstance = instantiate(element)
  parentDOM.replaceChild(newInstance.dom, prevInst.dom)
  return newInstance
}


function instantiate (element) { // IN element, parent DOM; OUT dom, newVnode
  const dom = element.type === 'TEXT' 
    ? dom = document.createTextNode(element.props.nodeValue)
    : dom = document.createElement(element.type)

  updateDOMProperties(dom, element.props, {}, false)
  const childInstances = element.props.children.map(instantiate)
  const childDOMS = childInstances.map(child => child.dom)
  childDOMS.forEach(child => dom.appendChild(child))

  return {dom, element, childInstances}
}

function updateDOMProperties (dom, newProps, prevProps={}, newElement=true) {
  const isListener = listener => listener.startsWith('on')
  const tempObject = Object.assign({}, prevProps, newProps)
  let keys = Object.keys(tempObject).filter(x => x !== 'children')

  for (let x of keys) {
    if (x in newProps) {
      if (newProps[x] === prevProps[x] && !newElement){
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
}

function recoChildren(element, previousInstance) {
  const dom = previousInstance.dom
  const previousChildInstances = previousInstance.childrenInstances
  const newChildren = element.props.children
  let newChildInstances =[]
  for (let i of newChildren){
    newChildInstances.push(reco(dom, newChildren[i], previousChildInstances[i]).childInstances)
  }
  return newChildInstances
}

module.exports = render
