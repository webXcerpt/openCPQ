---
draft: true
date: 2015-07-17
author: hs
title: ConfigModeler vs. openCPQ
teaser: >
  A comparison 
---

*ConfigModeler* vs. *openCPQ*
=============================

[*ConfigModeler*](http://webXcerpt.com/ConfigModeler/) is ....................

It is based on a domain-specific language (DSL) for modeling a
particular class of products.  In contrast, *openCPQ* provides a
JavaScript API for building up models.  You can also say that
*ConfigModeler* is based on an "external" DSL, whereas *openCPQ* is
based on "internal" DSL embedded in JavaScript.

Both approaches allow you to use business-level concepts in your
models, which avoids repetitive and error-prone low-level work, and
which makes your models more concise and readable.  There are,
however, significant differences and trade-offs between the two
approaches:
- *openCPQ* is not just an approach for product modeling, but it
  also provides the core configuration system.  *ConfigModeler*
  emits models for some other configuration system.
- The *ConfigModeler* IDE can provide much more support for the
  modeler based on its understanding of the application domain and
  the high-level modeling language.  Furthermore, a *ConfigModeler*
  model may be syntactically even more concise and readable than an
  *openCPQ* model.
- Implementing an instance of *ConfigModeler* for a particular
  application domain may take several weeks, whereas
  application-specific abstractions for *openCPQ* are just
  JavaScript functions, which may be provided within hours.  Similar
  relations hold for the effort for adding new concepts to the
  respective environment.  In *openCPQ* new abstractions can easily
  be added by the modeler, whereas in *ConfigModeler* this requires
  quite some understanding of the underlying technologies (Eclipse,
  Xtext, EMF, Xtend).
- To use *ConfigModeler* you have to learn a new language (albeit a
  simple one), whereas with *openCPQ* you may re-use your knowledge
  of JavaScript and you "only" have to learn an API.

So, as a rough guideline, *ConfigModeler* is the better fit
- if for some reasons you have to use a particular configuration
  system,
- if you have many products using a relatively small and stable set
  of concepts, and
- if you want non-technical users to implement and maintain models.

On the other hand, *openCPQ* is the better fit
- if you are free to choose your configuration system,
- if you frequently need to introduce new abstractions for new kinds
  of features in your products,
- if your modelers already have some programming or scripting
  background.

It is even possible to combine the two approaches: Use
*ConfigModeler* for implementing "standard-type" models and compile
these models to JavaScript with calls to the *openCPQ*
API. "Non-standard" models or model parts can be implemented
directly in *openCPQ*.
