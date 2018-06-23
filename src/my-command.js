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
        height: 48,
        backgroundColor: '#315096'
      },
      {
        name: 'body',
        height: 300,
        flexGrow: 1,
        backgroundColor: '#7ED321'
      },
      {
        name: 'layer2',
        height: 48,
        backgroundColor: '#f5f5f5',
        flexDirection: yoga.FLEX_DIRECTION_ROW,
        children: [
          {
            name: 'body',
            width: 40,
            backgroundColor: 'red'
          },
          {
            name: 'body',
            width: 40,
            backgroundColor: 'blue'
          },
        ]
      }
    ]
  }

  const layers = []

  function getNode(nodeJson) {
    layers.push(nodeJson)
    const node = Node.create()
    node.setWidth(nodeJson.width || '100%')
    node.setHeight(nodeJson.height || '100%')
    if (nodeJson.flexGrow) {
      node.setFlexGrow(nodeJson.flexGrow)
    }
    if (nodeJson.flexDirection) {
      node.setFlexDirection(nodeJson.flexDirection)
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

  function childNodes(node) {
    let result = []
    for (let i = 0; i < node.getChildCount(); i++) {
      result.push(node.getChild(i));
    }
    return result
  }

  const root = getNode(json)
  const rootLayout = root.getComputedLayout()
  root.calculateLayout(rootLayout.width, rootLayout.height, yoga.DIRECTION_LTR)

  const artboard = new Artboard({
    name: layers[0].name,
    flowStartPoint: true,
    frame: new Rectangle(0, 0, root.getWidth(), root.getHeight()),
    parent: fromNative(context.document).selectedPage,
  })
  let current = 1

  const buildTree = (root, parentLayer) => {
    childNodes(root).map(childNode => {
      const layout = childNode.getComputedLayout()
      const props = layers[current]
      console.log(`[${current}]`,props, layout)
      current ++
      const frame = new Rectangle(layout.left, layout.top, layout.width, layout.height)

      const shape = new Shape({
        parent: parentLayer,
        name: props.name,
        frame,
      })

      shape.style.fills = [
        {
          color: props.backgroundColor,
          fillType: Style.FillType.Color,
        },
      ]

      if (childNodes(childNode).length > 0) {
        const newParentLayer = new Group({
          name: props.name + '-group',
          parent: parentLayer,
          frame
        })
        buildTree(childNode, newParentLayer)
      }

    })
  }

  buildTree(root, artboard)

  context.document.showMessage("DONE")
}
