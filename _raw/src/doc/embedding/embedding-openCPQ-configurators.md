---
title: Embedding
---

Embedding *openCPQ* Configurators
=================================

*Note: This document discusses the architecture of embedding openCPQ-based
configurators in other applications.
For specific examples see
[here](https://github.com/webXcerpt/openCPQ-odoo) (embedding into Odoo) and
[here](https://github.com/webXcerpt/openCPQ-example-optical-transport#an-embedding-application) (a minimal embedding).*


Introduction
------------

It is often useful to embed *openCPQ*-based configurators into an enterprise
application such as an ERP, CRM or e-commerce system.
When users work with a configur<u>able</u> product, they get the opportunity to
configur<u>e</u> the product using an appropriate configur<u>ator</u>.
The resulting configur<u>ed</u> product can then be added as an item to a
business document such as a quotation, an order or an invoice, or to a shopping
cart.

Providing configuration support in an enterprise application involves two
aspects:

- *Data management*: The embedding application must be able to
  distinguish between configur<u>able</u> and configur<u>ed</u> products.
  And of course there may still be unconfigurable products.
  A configur<u>able</u> product must be attached to an appropriate
  configur<u>ator</u>.
  A configur<u>ed</u> product carries its configur<u>ation</u>.
  Only unconfigurable and configur<u>ed</u> products can be used in business
  transactions.
- *System interaction*: The embedding application must be able to open and to
  close configurators and to interchange configurations and configuration
  results with a configurator.

The data-management functionality must be implemented as an extension to the
embedding enterprise application.  These systems are typically designed to
support extensions like this.  Some enterprise applications already come with
support for configurability.

Since an implementation of the data-management part depends mostly on the
embedding system and not that much on the configurator technology, we will not
go into more details here.  We will rather concentrate on the interaction
between an embedding application and a configurator.


Client Decoupling
-----------------

### Separate Windows

The embedding application and the configurator may be based on quite different
web technology, which can also be incompatible.
While there are modularization technologies for Javascript reducing
the risk of unwanted interference between components, a standardized
modularization technology such as [ECMAScript 2015
modules](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) is not
yet in general use nor is it generally supported by the browsers which are in
use today.
Furthermore interferences cannot only happen between Javascript code from the
two sides, but also regarding DOM and CSS behavior.

Therefore we recommend to display a configurator in a separate window.
To make this window controllable by the embedding application, it will be inside
an `iframe` element.
It is the embedding application's responsibility to open an `iframe` with a
`src` attribute pointing to the appropriate configurator and to close it again
when it is no more needed.

![architecture overview](architecture.png)

A nice extra benefit of this approach is that it does not only decouple
configurators from the embedding application, but also configurators from each
other.
In particular it is not necessary that all configurators use the same version of
*openCPQ* or other libraries.
So if you want to use a recent version of *openCPQ* or another library for
configuring a new product, you are not forced to upgrade the configurators for
your other configurable products.
Since the protocol for communicating with configurators is quite simple, it is
even possible to implement it for configurators which are not based on
*openCPQ* at all.


### A Component for Embedding Configurators

Enterprise applications with Web UIs typically use client-side components
implementing some given API.
Users of such an application can add their own components as long as these
components behave as expected.
The interfacing between the configurator and the embedder should be
implemented as such a component.

![architecture overview refined](architecture2.png)

Such an embedding component can and should be independent of particular
configurable products and their configurators.
It should only depend on a generic configurator interface provided by *openCPQ*
and on the extension interface of the enterprise application.



Communication
-------------

### Communication Counterpart

With the decoupling described above the question arises whether the
configurator should communicate with the client or the server of the embedding
enterprise application.

Enterprise applications often provide protocols for communicating with their
servers.
However we do not recommend to use this from a configurator.
We rather recommend to communicate exclusively with the client component of the
embedding application.
This is for the following reasons:

- This approach avoids a dependency on the server protocol in each configurator,
  which might become a maintenance problem.
  Communication with the server is better left to the client of the
  embedding application, which does this communication anyway.
- Configurators have to communicate with the embedder client anyway, for example
  to notify the embedder about configuration changes.
- The embedder client can save an updated configuration in a transaction
  together with other data.
  The embedder client might even decide to discard a configuration update.
- With this approach there is no need for the configurator to authenticate at
  the server and thus no need to receive and to manage credentials.


### Communication Mechanism

Then on a more technical level there is the question how the configurator in
the iframe communicates with the embedding window.
In a first attempt we implemented this via plain Javascript function calls.
However, this can impose risks to the embedding application if the configurators
are not fully trusted.
Due to the ["same-origin
policy"](https://en.wikipedia.org/wiki/Same-origin_policy) it works only if
the configurator resource is loaded from the same server as the embedding
application or if some HTTP headers explicitly allow the interaction.
Both conditions may be difficult to achieve.

A much safer approach is to use [cross-window
messaging](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).
This also makes it possible to load the configurator from a different server or
even from a plain file, which is particularly useful in a development or test
environment.


### Messages

The *openCPQ* library provides utilities for this messaging.
Function `embed` wraps the configurator in a top-level element sending and
receiving these messages:

- The configurator sends a `"ready"` message to the parent window when it has
  been loaded.
- In reply to this the configurator expects an `"init"` message, optionally
  carrying an initial configuration.
- When the user has completed a configuration or wants to discard it, the
  configurator sends a `"close"` message to the embedding window.

A `"close"` message may contain a new configuration to be stored by the
embedding application.
It can also be passed into another configurator instance via the `"init"`
message if a user wants to update the configuration later.
To reduce dependencies, configurations are encoded as strings in a format that
is opaque to the embedder.

Furthermore a `"close"` message may contain additional data derived from the
configuration such as a price or a textual representation to be used in business
documents.


### Secure Messaging

The cross-window messaging mechanism allows the sender of a message to specify
that the message should only be delivered if the target window contains a
document from a particular origin.  Similarly an incoming message is accompanied
by the URL of the sending document, which allows the receiver to ignore the
message if it is not from the expected document.

Since the embedding application knows the configurator's URL, it can
easily make use of these security mechanisms.  In contrast to this, on
the configurator side we cannot check if a message comes from the
"expected" embedding application (unless we hard-wired the embedder URL
in the configurator code, which would make the configurator harder to
manage).  As long as the configurator does not manipulate persistent
data and only communicates to its parent window (as recommended in
section "Communication Counterpart"), this should not be a security
problem from the configurator perspective.  If, however, the
configurator directly manipulates data on the server, more extensive
security mechanisms are needed.


### User Interface

The top-level component created by the `embed` function adds a toolbar to the
configurator providing

- "OK" and "Close" buttons (triggering a `"close"` message with or without
  return data) and
- undo/redo functionality which is handled internally in the configurator
  without any involvement of the embedding application.

It turned out that having the "OK" and "Close" buttons on a toolbar inside the
configurator iframe (as oppoosed to having these buttons in the embedding API)
does not only provide a better user experience but is also easier to implement.
Nevertheless it is usually a good idea if the embedding application/component
also provides the user with a way to forcefully close the configurator iframe,
just for the case that the configurator toolbar does not work due to some
problem in the configurator.

The embedder should react to a `"close"` message by closing the configurator
iframe and possibly storing any returned data.


Conclusion
----------

In this document we have described the architectural considerations for a
"standard" way of embedding *openCPQ*-based configurators.
For more details have a look at the code of the examples mentioned at the
beginning of this document.

If for whatever reason some of these decisions are not appropriate for your
case, feel free to deviate.
In particular it is not mandatory to use the `embed` function provided by
*openCPQ*.
You can implement your own embedding mechanism and even use bits and pieces
from *openCPQ* as needed.
