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

let rootInstance = null

export function render (element, container) {
  const prevInst = rootInstance
  const nextInst = reco(container, element, prevInst)
  rootInstance = nextInst
}

function reco (parentDOM, element, prevInst) {
  if (prevInst === null) {
    const newInstance = instantiate(element)
    parentDOM.appendChild(newInstance.dom)
    return newInstance
  }
  if (!element) {
    parentDOM.removechild(prevInst.element)
    return null
  }
  if (prevInst.element.type === element.type) {
    updateDOMProperties(prevInst.dom, element.props, prevInst.props, false)
    prevInst.childInstances = recoChildren (element, prevInst)
    prevInst.element = element
    return prevInst
  }
  if (typeof element.type === 'string') {
    const newInstance = instantiate(element)
    parentDOM.replaceChild(newInstance.dom, prevInst.dom)
    return newInstance
  }
  instance.publicInstance.props = element.props
  const childElement = instance.publicInstance.render()
  const oldChildInstance = instance.childInstance
  const childInstance = reco(parentDOM, oldChildInstance, childElement)
  instance.dom = childInstance.dom
  instance.childInstance= childInstance
  instance.element = element
  return instance
}


function instantiate (element) { // IN element, parent DOM; OUT dom, newVnode

  if (typeof element.type === 'string') {
    let dom = element.type === 'TEXT' 
      ? dom = document.createTextNode(element.props.nodeValue)
      : dom = document.createElement(element.type)

    updateDOMProperties(dom, element.props, {}, false)
    const childInstances = element.props.children.map(instantiate)
    const childDOMS = childInstances.map(child => child.dom)
    childDOMS.forEach(child => dom.appendChild(child))
    return {dom, element, childInstances}
  }
  const instance = {}
  const publicInstance = componentInstance(element, instance)
  const childElement = publicInstance.render()
  const childInstance = instantiate(childElement)
  const dom = childInstance.dom
  Object.assign(instance, {dom, element, childInstance, publicInstance})
  return instance
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
  const previousChildInstances = previousInstance.childInstance
  const newChildren = element.props.children
  let newChildInstances =[]
  for (let i=0, j = Math.max(newChildren.length, previousChildInstances.length); i < j; i++){
    newChildInstances.push(reco(dom, newChildren[i], previousChildInstances[i]).childInstance)
  }
  return newChildInstances.filter(child => child !== null)
}

export class Component {
  constructor(props){
    this.props = props
    this.state = this.state || {}
  }

  setState (update) {
    this.state = Object.assign({}, this.state, update)
    this.updateInstance(this._internalInstance)
  }

  updateInstance (internalInstance) {
    const parentDOM = internalInstance.dom.parentNode
    const element = internalInstance.element
    reco (parentDOM, element, internalInstance)
  }
}


function componentInstance (element, internalInstance) {
  const publicInstance = new element.type(element.props)
  publicInstance._internalInstance = internalInstance
  return publicInstance
}