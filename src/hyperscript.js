export default function h (element, props, ...args) {
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
