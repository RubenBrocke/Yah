# Yah - Yet Another HTMX

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
<div y-init="{ show = false }">
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

The y attribute is the core directive of Yah.

It defines a pipeline of actions using the following pattern:

> trigger -> action -> action -> ...

Each step in the pipeline runs sequentially.

Typical steps include:
- Fetching JSON APIs
- Rendering templates
- Updating the DOM

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
      y="@products render #t_products insert">
  </ul>
</div>
```

This does the following:
1. Fetches /api/products
2. Stores the result in local state
3. Renders the template #t_product
4. Inserts the result into the <ul> (default swap target is the element itself.)

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

#### Client side beheaviour

```html
<div y-init="{ open = false }">
  <div class="modal hidden"
       y="@open { class.hidden = !open }">

    <button y="@click { open = false }">
        Close
    </button>
  </div>

  <button y="@click { open = true }">
    Show!
  </button>
</div>
```

---

## Philosophy

Yah aims to stay:
- Small
- Declarative
- HTML-first
- API-friendly

It provides a simple way to build reactive interfaces while keeping the backend JSON-based and reusable.