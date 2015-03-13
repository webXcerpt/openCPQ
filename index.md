---
title: "A Browser-Based Product-Configuration Framework"
reference: Home
refurl: "/"
prio: 0
---

With openCPQ you can implement product configurators that run completely
in the browser.  Compared with the traditional approach of running a
configuration engine in a server this has advantages for IT operations
and end users:

- End users need not wait for round-trips to the server after each
  input, which allows them to work more smoothly.
- End users can even run the configurator while disconnected from the
  internet.  (This is possible due to HTML5's Offline Application
  Caching feature.)
- IT operations need not worry about scalability of a configuration
  server since they only need to host static web pages.

Product models are written as JavaScript programs using functions and
classes from the openCPQ library.  Compared with the traditional
approach of representing models as data structures in the configuration
engine's database this provides the following advantages to modellers
and IT operations:

- Models are text files.  So they can be read and modified with text
  editors, some of which even provide special support for JavaScript.
- Furthermore textual models can be managed in state-of-the art
  version-control systems such as Git or Subversion.  A version-control
  system providing HTTP access to its documents (with configurable
  access rights for different kinds of users) can even be used directly
  to host models and other resources for the end users.
- If modelers find themselves doing repetitive work such as implementing
  similar features for several products or components, they can use
  JavaScript functions and classes to define higher-level
  customer-specific concepts on top of the openCPQ API.  This can make
  models much easier to maintain.
- Since openCPQ is a quite thin layer on top of standard web technology,
  it is easy to learn for many persons.

Finally, since openCPQ is an open-source project published under the
liberal
[MIT license](https://raw.githubusercontent.com/openCPQ/openCPQ/master/LICENSE),

- there are no license fees to pay and
- you can even adapt openCPQ itself to your needs if the need should
  arise.

<!-- TODO
- link to demo (once we have a public one) and example code
-->
