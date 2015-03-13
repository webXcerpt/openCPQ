---
title: "Why We Started openCPQ"
---

*... and why we consider modeling to be a kind of programming.*

At [webXcerpt](http://www.webxcerpt.com) we have been modeling
configurable products since 2002, mostly for the telecom industry.  Over
time we have worked with various CPQ frameworks which were in use at our
customers.  While these frameworks had benefits like out-of-the-box
integration with ERP and CRM systems, we also had to deal with various
issues.

In our opinion, modeling configurable products is software development,
that is, a kind of programming.  So modelers should benefit from the
same tools and best practices as programmers use them.

Textual Modeling
----------------

We think that product models should be represented as text files.  This
has several benefits:

- You can edit the model with your favorite editor.  While you might
  still need to learn the modeling language, you get all the standard
  editing functionality out of the box: searching and replacing, copying
  and pasting, undo/redo, and so on.

  As opposed to this, CPQ frameworks often provide a specialized
  modeling UI where you can manipulate the model as some internal data
  structure.  You have to click through various dialogs to get to the
  part of the model you are interested in.  These UIs might support
  search&replace, copy&paste or undo/redo to some degree, but typically
  your favorite text editor is more mature.  And even with a very good
  modeling UI you have to spend some time learning how to use it.

- If you have two versions of a model, you can use a standard "diff"
  tool to figure out where the two versions differ.  Textual models can
  also be managed by version control systems.  It is your choice if you
  want to use a powerful distributed system such as GIT or a simpler one
  such as Subversion.

  Model versioning in CPQ frameworks is typically home-grown and less
  mature.  And again, even where it's good, it's different from what you
  are used to.  Finally, you cannot manage your models together with the
  other artefacts that you typically have in your project.

- You may even print out your model on paper.  Ok, I admit that this
  isn't that important anymore these days.  But you might still want to
  attach a model file to an e-mail or even paste a part of it directly
  into the cover letter.  The recipient needs no special-purpose
  software to read it.

I have the impression that typically the philosophy behind CPQ
frameworks is that modeling is (or should be) something simpler than
programming.  Modelers need not be programmers.  So modelers are
shielded from technicalities such as having to write text in an
appropriate syntax.  For very simple models this may be the right
approach.  But our experience shows that more complex models anyway
require modelers with software-development (read: programming) skills.
And these people become a lot more productive with state-of-the art
tools, which are typically based on textual programs.

By the way, while CPQ frameworks often represent the main structure of a
model in a non-textual way they do use a textual representation for
details, for example formulas.  GUI-based editing would simply become
too clumsy here, and modelers are expected to be able to work with
formulas.  (Notice that Excel follows a similar approach using textual
formulas in cells.)  Commonly CPQ frameworks even support embedded
programs which must be written in some home-grown programming languages.
In a way this takes the claim that modeling is not programming ad
absurdum.

To benefit from textual model representations (and by this I mean
actually human-readable and human-editable text, not just a model export
in some arcane XML dialect) we have implemented languages for
representing the product models of certain CPQ frameworks.  One example
for this is
[VClipse](http://www.vclipse.org).  It
provides a textual syntax for models of the SAP Variant Configurator.
But actually VClipse is quite a bit more: It is an integrated
development environment for this language supporting
- syntax highlighting in the editor,
- navigation in the model along hyperlinks from an identifier usage to
  the identifier's definition (or in the opposite direction),
- consistency checking with errors and warnings accessible directly in
  the code,
- autocompletion,

and several other features.  And of course VClipse can exchange models
with the SAP Variant Configurator.  ([Xtext](http://xtext.org) is very
helpful to implement such an IDE as an extension for
[Eclipse](http://www.eclipse.org) with reasonable effort.)


Higher-Level Modeling
---------------------

In past projects we also noticed that modeling as supported by CPQ
frameworks happens at a quite low level.  Of course the frameworks
cannot provide customer-specific abstractions out of the box because
they are intended for many very different customers.  And since the
frameworks pretend that modeling is not programming they don't provide
powerful mechanisms by which modelers could define their own
customer-specific abstractions.  Our approach to cope with this was

- to define a customer-specific language for high-level modeling,
- to implement an IDE for this language (again with Xtext and Eclipse),
- and to provide a compiler from this high-level language to the
  CPQ framework's lower-level model representation (or to the textual
  language mentioned in the previous section).

<!-- TODO
reference to CWG presentation (avalable via the VClipse web site)
-->

As an example, languages for telecom suppliers support concepts like
"slots", into which one can plug "boards" containing the electronics for
certain interfaces.

With this approach it is not only possible to write concise models in a
language easily understood by the customer.  The IDE can also support
the modeler at that same high level, for example in error messages.
This actually made many modeling tasks accessible to people without a
programming background.


Modeling in a "Real" Programming Language
-----------------------------------------

Using a customer-specific high-level modeling language has the drawback
that it requires quite some effort to introduce a new abstraction.  You
have to extend the language, the IDE, and the compiler.

Therefore we think that it makes sense to use a programming language for
modeling.  This allows the modeler to define abstractions (functions,
types) by himself without requiring changes to language, IDE, and
compiler.  The "modeling primitives" are provided as library functions
and types.

And while each programming language has its drawbacks, it nevertheless
makes sense to use some popular existing language.  There are not only
many people around who could work with the language, but you can also
expect many available tools and libraries.


Modeling with HTML and JavaScript
---------------------------------

In the same time when we gained the above insights, another development
happened: Web technologies matured and browsers became more and more
capable.

This brought us to the idea that we can switch to standard technologies
not only on the language side to support flexible abstractions, but also
for the "modeling primitives", that is,

- choices (possibly implemented as menus),
- yes/no decisions (check boxes)
- text input fields,
- making the presence of certain inputs dependent on the values entered
  to other inputs,
- and so on.

HTML, JavaScript APIs, and web-application frameworks such as AngularJS
provide much of this.  And they provide much more flexibility for
defining the configuration UI than what CPQ frameworks typically provide
out of the box.

So we might think of implementing configurators directly based on these
technologies.  This is actually feasible, but a thin layer on top of
these technologies makes sense for two reasons:

- Typical configuration modeling tasks can make use of certain
  abstractions which are a bit higher-level but still quite generic.
- If we tell a potential customer that we intend to implement a
  configurator based just on standard technologies, whithout any CPQ
  framework, then that customer might get afraid that we are reinventing
  the wheel (and exposing the project to unnecessary development risks)
  instead of making use of some framework providing basic CPQ
  functionality.

So we implemented such a layer and called it openCPQ to give customers
the warm cosy (and justified!) feeling that we are not starting from
scratch.

Furthermore we remodeled a bunch of examples (products of our
past/existing customers and publicly available product models) with
openCPQ.  These models were used to drive the implementation of openCPQ,
suggesting useful abstractions.  Furthermore they are now used to
showcase the power of openCPQ.


More on Browser-Based Configuration
-----------------------------------

Notice that running the configurator in the browser has these benefits
in addition to the fact that the modeling is based on standard and
state-of the art tools:

- From an operational point of view there is no need to host an
  application server for the business logic.  A web server for static
  content suffices.
  
  <!-- TODO
  Application server for business logic is not needed.
  Their architecture, implementation, and operation is usually very complex 
  since they have to manage many simultaneous sessions independently and efficiently.
  -->
  
- Configurators can also be loaded from the local file system, which
  makes them usable in "offline mode", that is, without any need for a
  server.
- Since there are no roundtrips to the server upon configuration updates
  the application feels much faster for the end user.

  <!-- TODO
  Single-page application (have some buzzwords here to be found be
  Google), in-memory (vs SAP HANA)
  -->

Some CPQ frameworks use an incremental reasoning algorithm.  That is,
when a user changes some input, the algorithm propagates the change over
the configuration along the dependencies and performs changes only to
the affected parts of the model.  This is supposed to improve the
configurator's efficiency.

Nevertheless openCPQ recomputes the entire configuration from the
collected explicit user input after each change for the following
reasons:

- Incremental change propagation requires a lot of bookkeeping how
  certain values in a configuration are justified by other values.  This
  can consume quite some memory.  And maintaining these justifications
  also costs processor time, which may in some cases even outweigh the
  original savings brought by the incremental evaluation.
- Incremental change propagation is more error-prone.  You cannot only
  make mistakes in the actual calculations, but also in the decisions
  where to propagate a change.  As a consequence you also have to test
  much more: It does not suffice to test that a particular set of user
  inputs leads to a particular configuration.  You also have to test that
  all the ways that can lead to a particular user-input set will also
  lead to the same full configuration.
- Finally, computation cost in a configurator is anyway dominated by GUI
  rendering, not by the business logic.

This approach does not fit well with popular MVC-based web-application
frameworks such as AngularJS or EmberJS.  Fortunately a relatively
recent contender in the field, Facebook's [ReactJS](http://reactjs.com),
fits exactly with our approach.  It also performs full recomputation of
the UI up to a representation of the DOM structure.  Only the final (and
possibly expensive) updates to the actual DOM in the browser are
performed incrementally.


Synthesis
---------

The power of modeling with a general-purpose programming language comes
at a cost.  An IDE cannot understand user-defined abstractions in that
much detail as it is possible for an abstraction built into the
language.  That is, an IDE for a general-purpose langauge can provide
less help to the modeler (regarding error messages, completions, ...)
than an IDE for a specialized modeling language could.  Furthermore
JavaScript is a dynamically typed language, which also limits the amount
of understanding that an IDE can get about a program and thus also the
amount of help that it can provide.

We are following two approaches to alleviate this:

- We can still work with customer-specific high-level languages.
  Compiling these languages to the general-purpose language JavaScript
  (with openCPQ as the run-time library) is even easier than compiling
  to the modeling idiosyncrasies of other CPQ frameworks.
- We will make use of new developments in the JavaScript world
  supporting static typing, such as
  [TypeScript](http://www.typescriptlang.org) or
  [Flow](http://flowtype.org).

But notice that the flexibility of the openCPQ approach allows you
already today to create elegant models very quickly.


Summary
-------

The development of openCPQ was initially motivated by our
dissatisfaction with the modeling support in existing CPQ frameworks.
And we think we have found an appealing solution.

Nevertheless, CPQ frameworks are typically not chosen for their
modeling merits.  Business people tend to see the modeling as a
one-time effort, even though models evolve together with their product.
Runtime issues (the actual configurations, data exchange with other
systems, ...) are often more important.  Here openCPQ scores with the
benefits of its browser-based implementation such as speed and offline
usability.
