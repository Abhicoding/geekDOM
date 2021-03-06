const reco = require('./reco-render').reco

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
  
  export function componentInstance (element, internalInstance) {
    const {type, props} = element
    var publicInstance
    try {
      publicInstance = new type(props)
    } catch {
      publicInstance = type(props)
    }
    publicInstance._internalInstance = internalInstance
    return publicInstance
  }