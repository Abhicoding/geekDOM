export default function updateDOMProperties (dom, newProps, prevProps={}, newElement=true) {
    const isListener = listener => listener.startsWith('on')
    const tempObject = Object.assign({}, prevProps, newProps)
    let keys = Object.keys(tempObject).filter(x => x !== 'children')
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