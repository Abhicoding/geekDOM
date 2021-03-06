const updateDOMProperties = require('./dom-utilities').default
const componentInstance = require('./component').componentInstance

let rootInstance = null

export function render (element, container) {
  const prevInst = rootInstance
  const nextInst = reco(container, element, prevInst)
  rootInstance = nextInst
}

export function reco (parentDOM, element, prevInst) {
  if (prevInst === null) {
    const newInstance = instantiate(element)
    parentDOM.appendChild(newInstance.dom)
    return newInstance
  }
  if (!element) {
    parentDOM.removeChild(prevInst.dom)
    return null
  }
  if (prevInst.element.type !== element.type) {
    const newInstance = instantiate(element)
    parentDOM.replaceChild(newInstance.dom, prevInst.dom)
    return newInstance
  }
  if (typeof element.type === 'string') {
    updateDOMProperties(prevInst.dom, element.props, prevInst.props, false)
    prevInst.childInstances = recoChildren (element, prevInst)
    prevInst.element = element
    return prevInst
  }
  prevInst.publicInstance.props = element.props
  const childElement = prevInst.publicInstance.render ? prevInst.publicInstance.render() : prevInst.element
  const oldChildInstance = prevInst.childInstance
  const childInstance = reco(parentDOM, childElement,oldChildInstance)
  prevInst.dom = childInstance.dom
  prevInst.childInstance= childInstance
  prevInst.element = element
  return prevInst
}

function instantiate (element) { // IN element; OUT newVnode
  var dom
  if (typeof element.type === 'string') {
    if (element.type === 'TEXT') {
      dom = document.createTextNode(element.props.nodeValue)
    } else {
      dom = document.createElement(element.type)
    }
    updateDOMProperties(dom, element.props, {}, false)
    const childInstances = element.props.children.map(instantiate)
    const childDOMS = childInstances.map(child => child.dom)
    childDOMS.forEach(child => dom.appendChild(child))
    return {dom, element, childInstances}
  }
  const instance = {}
  const publicInstance = componentInstance(element, instance)
  const childElement = publicInstance.render ? publicInstance.render() : publicInstance
  const childInstance = instantiate(childElement)
  dom = childInstance.dom
  Object.assign(instance, {dom, element, childInstance, publicInstance})
  return instance
}

function recoChildren(element, previousInstance) {
  const dom = previousInstance.dom
  const previousChildInstances = previousInstance.childInstances
  const newChildren = element.props.children
  let newChildInstances =[]
  for (let i=0, j = Math.max(newChildren.length, previousChildInstances.length); i < j; i++){
    newChildInstances.push(reco(dom, newChildren[i], previousChildInstances[i]))
  }
  return newChildInstances.filter(child => child !== null)
}