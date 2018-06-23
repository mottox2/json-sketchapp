import yoga, { Node } from 'yoga-layout'
import { fromNative } from 'sketch'
import { Document, Artboard, Rectangle, Group, Shape, Style } from 'sketch/dom'

export default function(context) {
  const json = {
    name: 'root',
    width: 375,
    height: 667,
    children: [
      {
        name: 'layer1',
        width: 100,
        height: 48,
        backgroundColor: '#315096'
      },
      {
        name: 'body',
        width: 300,
        height: 300,
        flexGrow: 1,
        backgroundColor: '#7ED321'
      },
      {
        name: 'layer2',
        width: 300,
        height: 48,
        backgroundColor: '#f5f5f5'
      }
    ]
  }

  const layers = []

  function getNode(nodeJson) {
    layers.push(nodeJson)
    const node = Node.create()
    node.setWidth(nodeJson.width)
    node.setHeight(nodeJson.height)
    if (nodeJson.flexGrow) {
      node.setFlexGrow(nodeJson.flexGrow)
    }
    getChildNodes(nodeJson).map((childNode, index) => {
      node.insertChild(childNode, index)
    })
    return node
  }

  function getChildNodes(nodeJson) {
    if (!nodeJson.children) return []
    return nodeJson.children.map(childNodeJson => getNode(childNodeJson))
  }

  const root = getNode(json)
  const rootLayout = root.getComputedLayout()
  root.calculateLayout(rootLayout.width, rootLayout.height, yoga.DIRECTION_LTR)

  const result = JSON.stringify(root.getChild(0).backgroundColor ,null, '    ')
  console.log(result)

  function childNodes(node) {
    let result = []
    for (let i = 0; i < node.getChildCount(); i++) {
      console.log(i)
      result.push(node.getChild(i));
    }
    return result
  }

  const artboard = new Artboard({
    name: layers[0].name,
    flowStartPoint: true,
    frame: new Rectangle(0, 0, root.getWidth(), root.getHeight()),
    parent: fromNative(context.document).selectedPage,
  })
  let current = 1
  childNodes(root).map(childNode => {
    const layout = childNode.getComputedLayout()
    const props = layers[current]
    current ++
    console.log(props)

    const frame = new Rectangle(layout.left, layout.top, layout.width, layout.height)
    if (childNodes(childNode).length > 0) {
      new Group({
        parent: artboard,
        frame
      })
    } else {
      const shape = new Shape({
        parent: artboard,
        name: props.name,
        frame,
      })

      shape.style.fills = [
        {
          color: props.backgroundColor,
          fillType: Style.FillType.Color,
        },
      ]
    }
  })

  context.document.showMessage("It's alive")
}
