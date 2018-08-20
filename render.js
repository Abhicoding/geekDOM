
let x = {
  type: 'div',
  props: {
    id: ''
  },
  children: [{type: 'p'}]
}

function render (element, parentDOM) {
  const dom = document.createElement(element.type)
  if (element.children.length > 0) {
    element.children.forEach(child=> {
      render(child, dom);
    })
  }
  parentDOM.appendChild(dom)
}