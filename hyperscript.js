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


module.exports = h
