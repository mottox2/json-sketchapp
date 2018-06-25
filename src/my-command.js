import yoga, { Node } from 'yoga-layout'
import { fromNative } from 'sketch'
import { Document, Artboard, Rectangle, Group, Shape, Style, Text } from 'sketch/dom'

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
        flexDirection: 'row',
        children: [
          {
            name: 'body',
            width: 40,
            backgroundColor: 'green',
            text: 'Nav1'
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
      node.setFlexDirection({
        row: yoga.FLEX_DIRECTION_ROW,
        'row-reverse': yoga.FLEX_DIRECTION_ROW_REVERSE,
        column: yoga.FLEX_DIRECTION_COLUMN,
        'column-reverse': yoga.FLEX_DIRECTION_COLUMN_REVERSE,
      }[nodeJson.flexDirection])
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

  const buildTree = (root, parentLayer) => {
    childNodes(root).map(childNode => {
      const layout = childNode.getComputedLayout()
      const props = layers[current]
      console.log(`[${current}]`,props, layout)
      current ++
      const frame = new Rectangle(layout.left, layout.top, layout.width, layout.height)

      if (props.backgroundColor) {
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
      }

      if(props.text) {
        new Text({
          text: props.text,
          parent: parentLayer
        })
      }

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

  let current = 1
  const run = (json) => {
    fromNative(context.document).selectedPage.layers.forEach(layer => layer.remove())
    const root = getNode(json)
    const rootLayout = root.getComputedLayout()
    root.calculateLayout(rootLayout.width, rootLayout.height, yoga.DIRECTION_LTR)

    const artboard = new Artboard({
      name: layers[0].name,
      flowStartPoint: true,
      frame: new Rectangle(0, 0, root.getWidth(), root.getHeight()),
      parent: fromNative(context.document).selectedPage,
    })
    buildTree(root, artboard)
    context.document.showMessage("DONE")
  }

  // run(json)

  // https://qiita.com/littlebusters/items/b919693f4f3d4c183ce0#json%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E9%81%B8%E6%8A%9E%E3%81%97%E3%81%A6%E3%83%91%E3%83%BC%E3%82%B9
  var openPanel = NSOpenPanel.openPanel();
    openPanel.setTitle( "Choose a JSON File" ); // ダイアログのタイトル
    openPanel.setCanCreateDirectories = false; // ディレクトリの作成を許可するか
    openPanel.setCanChooseFiles = true; // ファイル選択を許可するか

  var fileTypes = ['json']; // 選択できるファイルタイプを設定
  var openPanelButtonPressed = openPanel.runModalForDirectory_file_types_( nil, nil, fileTypes );

  if ( openPanelButtonPressed == NSFileHandlingPanelOKButton ) {
    var filePath = openPanel.URL().path();
    var selectedJson = JSON.parse( NSString.stringWithContentsOfFile( filePath ) );
    console.log(selectedJson)
    log( 'Open File from: ' + filePath );
    run(selectedJson)
  } else {
    return false;
  }
}
