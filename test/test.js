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
  console.log(prevInst.publicInstance, '***prevInst***')
  const childElement = prevInst.publicInstance.render ? prevInst.publicInstance.render() : prevInst.element
  const oldChildInstance = prevInst.childInstance
  const childInstance = reco(parentDOM, childElement, oldChildInstance)
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
  const childElement = publicInstance.render ? publicInstance.render() : publicInstance
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
  console.log('***componentInstance****', element,'*', internalInstance, '*', publicInstance)
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
    vdom = addChildtoVdom(vdom, args)
    return vdom
}

function addChildtoVdom (vDom, childArray) {
  childArray.forEach(child => {
    if (isTextNode(child)) {
      return vDom.props.children.push(createTextNode(child))
    }
    if (Array.isArray(child)) {
      return addChildtoVdom(vDom,child)
    }
    return vDom.props.children.push(child)
  })
  return vDom
}


  
function isTextNode (node){
  return !(node instanceof Object)
}

function createTextNode (value) {
  return {type: 'TEXT', props: {nodeValue: value, children:[]}}
}

// @jsx h

class Test extends Component {
  render() {
    return (
      <div>
        <Head/>
        <Body/>
      </div>
    )
  }
}

const Head = () => {
  return (
    <div>
      <h1>Test component</h1>
    </div>
  )
}
class Body extends Component {
  constructor() {
    super ()
    this.state ={
      count:0,
      toggle: false
    }
    this.increase = this.increase.bind(this)
  }
  
  increase () {
    this.setState({
      count: this.state.count + 1,
      toggle: !this.state.toggle
    })
  }

  render () {
    return (
      <div>
        <p>{this.state.count}</p>
        {this.state.toggle ? <h1>Hello</h1> : <h2>World</h2>}
        <Button increase={this.increase} value={'Increase'} />
      </div>
    )
  }
}

const Button = ({increase, value}) => {
  return (
    <div  onClick={increase}>{value}</div>
  )
}
  
render (<Test />, document.getElementById('root'))