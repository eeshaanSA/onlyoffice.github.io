console.log("work")
window.Asc.plugin.init = function init() {}
window.Asc.plugin.button = function button(id) {
  this.executeCommand("close", "")
}
window.Asc.plugin.event_onContextMenuShow = function event_onContextMenuShow(options) {
  switch (options.type) {
  case "Target":

    this.executeMethod("AddContextMenuItem", [{
      guid: this.guid,
      items: [
        {
          id: "onClickItem1",
          text: {en: "Item 1", de: "Menü 1"},
          items: [
            {
              id: "onClickItem1Sub1",
              text: {en: "Subitem 1", de: "Untermenü 1"},
              disabled: true,
            },
            {
              id: "onClickItem1Sub2",
              text: {en: "Subitem 2", de: "Untermenü 2"},
              separator: true,
            },
          ],
        },
        {
          id: "onClickItem2",
          text: {en: "Item 2", de: "Menü 2"},
        },
      ],
    }])
    break

  case "Selection":

    this.executeMethod("AddContextMenuItem", [{
      guid: this.guid,
      items: [
        {
          id: "onClickItem3",
          text: {en: "Item 3", de: "Menü 3"},
        },
      ],
    }])
    break

  case "Image":
  case "Shape":

    this.executeMethod("AddContextMenuItem", [{
      guid: this.guid,
      items: [
        {
          id: "onClickItem4",
          text: {en: "Item 4", de: "Menü 4"},
        },
      ],
    }])
    break

  default:
    break
  }
}
window.Asc.plugin.attachContextMenuClickEvent("onClickItem1Sub1", () => {
  window.Asc.plugin.executeMethod("InputText", ["clicked: onClickItem1Sub1"])
})
window.Asc.plugin.attachContextMenuClickEvent("onClickItem1Sub2", () => {
  window.Asc.plugin.executeMethod("InputText", ["clicked: onClickItem1Sub2"])
})
window.Asc.plugin.attachContextMenuClickEvent("onClickItem2", () => {
  window.Asc.plugin.executeMethod("InputText", ["clicked: onClickItem2"])
})
window.Asc.plugin.attachContextMenuClickEvent("onClickItem3", () => {
  window.Asc.plugin.executeMethod("InputText", ["clicked: onClickItem3"])
})
window.Asc.plugin.attachContextMenuClickEvent("onClickItem4", () => {
  console.log("clicked: onClickItem4")
})
window.Asc.plugin.event_onTargetPositionChanged = function event_onTargetPositionChanged() {
  console.log("event: onTargetPositionChanged")
}