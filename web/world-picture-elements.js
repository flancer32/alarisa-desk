import {objectLabel} from "./world-picture.js";

function make(tag, text) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}

export class WorldPictureTree extends HTMLElement {
  constructor() {
    super();
    this.expanded = new Set();
    this.picture = undefined;
    this.selectedId = undefined;
    this.addEventListener("click", (event) => this.onClick(event));
    this.addEventListener("keydown", (event) => this.onKeydown(event));
  }

  setPicture(picture, selectedId) {
    this.picture = picture;
    this.selectedId = selectedId;
    this.expanded = new Set((picture.tree ?? []).map((node) => node.objectId));
    this.render();
  }

  onClick(event) {
    const toggle = event.target.closest("[data-toggle]");
    if (toggle) {
      const id = Number(toggle.dataset.toggle);
      if (this.expanded.has(id)) this.expanded.delete(id);
      else this.expanded.add(id);
      this.render();
      return;
    }
    const item = event.target.closest("[role=treeitem]");
    if (item) this.select(Number(item.dataset.objectId), "select");
  }

  onKeydown(event) {
    const item = event.target.closest("[role=treeitem]");
    if (!item) return;
    const items = [...this.querySelectorAll("[role=treeitem]")];
    const index = items.indexOf(item);
    const focus = (next) => {
      const nextItem = items[next];
      nextItem?.focus();
      if (nextItem) this.select(Number(nextItem.dataset.objectId), "focus");
    };
    const id = Number(item.dataset.objectId);
    if (event.key === "ArrowDown") { event.preventDefault(); focus(index + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); focus(index - 1); }
    else if (event.key === "ArrowRight") {
      event.preventDefault();
      const group = item.parentElement.querySelector(":scope > [role=group]");
      if (group && !this.expanded.has(id)) {
        this.expanded.add(id);
        this.render();
        this.querySelector(`[data-object-id="${id}"]`)?.focus();
      } else if (group) {
        const child = group.querySelector("[role=treeitem]");
        child?.focus();
        if (child) this.select(Number(child.dataset.objectId), "focus");
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const group = item.parentElement.querySelector(":scope > [role=group]");
      if (group && this.expanded.has(id)) {
        this.expanded.delete(id);
        this.render();
        this.querySelector(`[data-object-id="${id}"]`)?.focus();
      } else {
        const parent = item.parentElement.parentElement.closest("[role=treeitem]");
        parent?.focus();
        if (parent) this.select(Number(parent.dataset.objectId), "focus");
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select(id, "select");
    }
  }

  select(objectId, kind) {
    this.dispatchEvent(new CustomEvent(`world-picture-${kind}`, {bubbles: true, detail: {objectId}}));
  }

  render() {
    this.replaceChildren();
    const tree = make("ul");
    tree.setAttribute("role", "tree");
    tree.setAttribute("aria-label", "World Picture hierarchy");
    for (const node of this.picture?.tree ?? []) tree.append(this.renderNode(node, 1));
    if (!tree.childElementCount) tree.append(make("li", "No Objects are available in the current World Picture."));
    this.append(tree);
  }

  renderNode(node, level) {
    const row = make("li");
    row.setAttribute("role", "none");
    const item = make("div");
    item.className = "tree-item";
    item.setAttribute("role", "treeitem");
    item.setAttribute("aria-level", String(level));
    item.dataset.objectId = String(node.objectId);
    item.tabIndex = node.objectId === this.selectedId ? 0 : -1;
    const children = node.children ?? [];
    if (children.length) {
      item.setAttribute("aria-expanded", String(this.expanded.has(node.objectId)));
      const toggle = make("button", this.expanded.has(node.objectId) ? "−" : "+");
      toggle.type = "button";
      toggle.dataset.toggle = String(node.objectId);
      toggle.setAttribute("aria-label", `${this.expanded.has(node.objectId) ? "Collapse" : "Expand"} ${objectLabel(node.objectId)}`);
      item.append(toggle);
    } else item.append(make("span", "•"));
    item.append(make("span", objectLabel(node.objectId)));
    row.append(item);
    if (children.length && this.expanded.has(node.objectId)) {
      const group = make("ul");
      group.setAttribute("role", "group");
      for (const child of children) group.append(this.renderNode(child, level + 1));
      row.append(group);
    }
    return row;
  }
}

export class WorldPictureDetail extends HTMLElement {
  setPicture(picture, objectId) {
    this.replaceChildren();
    const object = (picture.objects ?? []).find((candidate) => candidate.id === objectId);
    if (!object) return;
    this.append(make("h2", objectLabel(objectId)));
    const relationTypes = new Map((picture.relationTypes ?? []).map((type) => [type.id, type.code]));
    const relations = (picture.relations ?? []).filter((relation) => relationTypes.get(relation.typeId) !== "case-parent");
    const links = make("section");
    links.append(make("h3", "Cross-links"));
    if (!relations.length) links.append(make("p", "No cross-links are available for this Object."));
    for (const relation of relations) {
      const targetId = relation.sourceObjectId === objectId ? relation.targetObjectId : relation.sourceObjectId;
      const button = make("button", `${relationTypes.get(relation.typeId) ?? "Relation"}: ${objectLabel(targetId)}`);
      button.type = "button";
      button.addEventListener("click", () => this.dispatchEvent(new CustomEvent("world-picture-cross-link", {bubbles: true, detail: {objectId: targetId}})));
      links.append(button);
    }
    this.append(links);
    const components = make("section");
    components.append(make("h3", "Components"));
    const componentTypes = new Map((picture.componentTypes ?? []).map((type) => [type.id, type.code]));
    const propertyTypes = new Map((picture.propertyTypes ?? []).map((type) => [type.id, type.code]));
    if (!(object.components ?? []).length) components.append(make("p", "No components are available."));
    for (const component of object.components ?? []) {
      const heading = make("h4", componentTypes.get(component.typeId) ?? `Component #${component.id}`);
      components.append(heading);
      const properties = make("dl");
      for (const property of component.properties ?? []) {
        properties.append(make("dt", propertyTypes.get(property.typeId) ?? `Property #${property.id}`));
        properties.append(make("dd", JSON.stringify(property.value)));
      }
      components.append(properties);
    }
    this.append(components);
  }

  clear() { this.replaceChildren(); }
}

customElements.define("world-picture-tree", WorldPictureTree);
customElements.define("world-picture-detail", WorldPictureDetail);
