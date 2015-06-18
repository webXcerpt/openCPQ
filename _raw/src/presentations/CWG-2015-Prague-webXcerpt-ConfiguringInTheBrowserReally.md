---
date: 2015-04-28
title: Configuring in the Browser, Really!
presenter: [tg, hs]
venue: CWG European Conference Prague 2015, SAP Configuration Workgroup
venue_url: http://www.configuration-workgroup.com/
pdf_url: https://github.com/webXcerpt/openCPQ/blob/master/doc/presentations/CWG-2015-Prague-webXcerpt-ConfiguringInTheBrowserReally.pdf
pdf_expanded_url: https://github.com/webXcerpt/openCPQ/blob/master/doc/presentations/CWG-2015-Prague-webXcerpt-ConfiguringInTheBrowserReally-expanded.pdf
slideshare_url: http://de.slideshare.net/TimGeisler/configuring-in-the-browser-really
slideshare_embedcode: 9K6aDNehxchkTT
youtube_embedcode:

---

We present an approach for tackling common problems in configuration
frameworks:
- It is often difficult to map a conceptual model of a configurable
  product into the restricted capabilities of configuration engines.
  For the end user this leads to suboptimal UIs.
- The communication between a custom UI front-end and the configuration
  engine is cumbersome to implement.  For the end user the need for
  round-trips between the UI and the configuration server can cause a
  sluggish user experience.

With HTML5 and JavaScript-based UI frameworks such as React.js browsers
have advanced into a powerful application platform.  This allows to run
not only the UI but also the configuration logic in the browser.

This benefits the work of various stakeholders:
- Modelers are provided with powerful data structures and the ability to
  define their own concepts.
- Gradually extending the standard UI with custom features becomes easy
  and is based on standard technologies.
- End users will enjoy the user experience of modern web applications.
- End users can even use configurators in offline mode, without access
  to a server.
- There is no need to run and maintain a server-side configuration
  engine.

We demonstrate this approach with concrete products and discuss the
integration with an SAP back end.
