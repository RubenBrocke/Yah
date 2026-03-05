# Yah — Yet Another HTMX Companion

## Introduction

Yah is a lightweight framework designed to simplify working with HTMX and JSON APIs while keeping the development model small and simple.

Instead of returning HTML partials from the backend, Yah allows you to:
- Fetch JSON data
- Store it in local state
- Render templates reactively

**Features**
- Simple JSON data fetching
- Local state management
- Reactive template rendering
- Minimal client-side DSL
- Works alongside HTMX

---

## Motivation

When using HTMX, the backend typically returns HTML partials (subdocuments) that are swapped into the page. While this works well for server-driven applications, it has an important downside:

The backend becomes tightly coupled to HTML rendering.

This makes it difficult for other clients (mobile apps, scripts, other services) to reuse the same API.

Modern APIs usually solve this by returning JSON instead.

Yah bridges this gap by combining:
- Custom attributes
- Mustache templates
- Reactive state management

This allows you to:
1. Fetch JSON from APIs
2. Store it in local component state
3. Render HTML templates reactively

---

## Quick Start

### y-init

The `y-init` attribute initializes the local scope of an element.

It can be used in two ways.

---

#### Local State

This usage is similar to state initialization in Alpine.js.

You can define simple values using an object-like syntax.

```html
<div y-init="{ show: false }">
</div>
```

The values defined here become available to all `y` and `y-action` directives inside the element.

---

#### Remote Data

`y-init` can also fetch data from a JSON API and store it in the local scope.

<div y-init="GET /api/products">
</div>

The JSON response is merged into the component’s state.

---

### The y Attribute

The `y` attribute is the core directive of Yah.

It allows you to:
- Trigger actions from events
- Fetch JSON APIs
- Render templates
- Perform DOM swaps
- Update state

---

**Example**

```html
<div y-init="GET /api/products">
  <template id="t_product" lang="mustache">
    {{#products}}
    <li class="product">{{id}} - {{name}}</li>
    {{/products}}
  </template>

  <ul id="product_list"
      y="@load @products -> #t_product .:insert">
  </ul>
</div>
```

This does the following:
1. Fetches /api/products
2. Stores the result in local state
3. Triggers rendering when:
   - the component loads
   - the products value changes
4. Renders the template #t_product
5. Inserts the result into the <ul>

---

#### Fetching Data

The `y` attribute can also fetch new data for the current scope.

```html
<button y="@click GET /api/products">
  Reload
</button>
```

This fetches the JSON again and shallow merges it into the existing scope.

---

#### Updating State With Responses

Sometimes you want to control how the response updates the state.

You can provide a small DSL block to define the update behavior.

```html
<form y="@submit POST /api/products { products += response.product }">
  <input name="name">
  <button>Add</button>
</form>
```

Instead of merging the full response, this expression appends the new product to the existing list.

Since products changes, any listeners such as @products will automatically trigger.

---

### y-action

`y-action` is a simplified version of y.

It focuses purely on client-side state updates and element manipulation, without making network requests.

It also allows updating properties of the element itself.

---

**Example**

```html
<div y-init="{ open = false }">
  <div class="modal hidden"
       y-action="@open { class.hidden = !open }">
  </div>

  <button y-action="@click { open = true }">
    Show!
  </button>
</div>
```

What happens here:
1. The component starts with open = false
2. Clicking the button sets open = true
3. The @open action updates the modal
4. The hidden class is removed when open becomes true

---

Philosophy

Yah aims to stay:
- Small
- Declarative
- HTML-first
- API-friendly

It provides a simple way to build reactive interfaces while keeping the backend JSON-based and reusable.