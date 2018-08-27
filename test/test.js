let rootInstance = null

function render (element, container) {
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
    console.log(element, prevInst, '???') // problem is happening here
    parentDOM.removeChild(prevInst.dom)
    return null
  }
  if (prevInst.element.type !== element.type) {
    const newInstance = instantiate(element)
    parentDOM.replaceChild(newInstance.dom, prevInstdom)
    return newInstance
  }
  if (typeof element.type === 'string') {
    updateDOMProperties(prevInst.dom, element.props, prevInst.props, false)
    prevInst.childInstances = recoChildren (element, prevInst)
    prevInst.element = element
    return prevInst
  }
  prevInst.publicInstance.props = element.props
  const childElement = prevInst.publicInstance.render()
  const oldChildInstance = prevInst.childInstance
  const childInstance = reco(parentDOM, childElement,oldChildInstance)
  prevInst.dom = childInstance.dom
  prevInst.childInstance= childInstance
  prevInst.element = element
  return prevInst
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
  let keys = Object.keys(tempObject).filter(x => x !== 'children') //May be you are not updating node value
  for (let x of keys) {
    if (x in newProps) {
      if (newProps[x] === prevProps[x] && !newElement){
        continue
      }
      if (x === 'nodeValue') {
        dom.textContent = newProps[x]
        continue
      }
      if (!isListener(x)) {
        dom.setAttribute(x, newProps[x])
        continue
      }
      dom.addEventListener(x.slice(2).toLowerCase(), newProps[x])
      continue
    }
    if (x === 'nodeValue') {
      dom.textContent = ''
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
  console.log(element, previousInstance, 'The answer lies here')
  const dom = previousInstance.dom
  const previousChildInstances = previousInstance.childInstances
  const newChildren = element.props.children // This is passing undefined
  let newChildInstances =[]
  for (let i=0, j = Math.max(newChildren.length, previousChildInstances.length); i < j; i++){
    newChildInstances.push(reco(dom, newChildren[i], previousChildInstances[i]))
  }
  return newChildInstances.filter(child => child !== null)
}

class Component {
  constructor(props){
    this.props = props
    this.state = this.state || {}
  }

  setState (update) {
    this.state = Object.assign({}, this.state, update)
    console.log(this._internalInstance, 'printing internalinst')
    this.updateInstance(this._internalInstance)
  }

  updateInstance (internalInstance) {
    const parentDOM = internalInstance.dom.parentNode
    const element = internalInstance.element
    reco (parentDOM, element, internalInstance)
  }
}


function componentInstance (element, internalInstance) {
  const {type, props} = element
  const publicInstance = new type(props)
  publicInstance._internalInstance = internalInstance
  return publicInstance
}

function h (element, props, ...args) {
    let vdom = {type: element}
    props !== null ? vdom.props = props : vdom.props = {}
    vdom.props.children=[]
    if (args.length == 0) {
      return vdom
    }
    args.forEach(child => {
      if (isTextNode(child)) {
        return vdom.props.children.push(createTextNode(child))
      }
      return vdom.props.children.push(child)
    })
    return vdom
  }
  
  function isTextNode (node){
    return !(node instanceof Object)
  }
  
  function createTextNode (value) {
    return {type: 'TEXT', props: {nodeValue: value, children:[]}}
  }

// @jsx h

class Test extends Component {
  constructor () {
    super()
    this.state = {
      count: 0
    }
    this.increase = this.increase.bind(this)
  }

  increase () {
    this.setState({count: this.state.count + 1})
    console.log('this ran', this.state.count)
  }
    render() {
      console.log(this._internalInstance, 'printing initial internal instance')
      return (
        <div>
          <h1>Test component</h1>
          <p>{this.state.count}</p>
          <button onClick={this.increase}>Increase</button>
        </div>
      )
    }
  }
  
render (<Test/>, document.getElementById('root'))