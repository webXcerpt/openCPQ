Website for the openCPQ project
===============================

Notes
-----

- The layout for posts puts the post's (date and) title as a heading at
  the top of the post.  So your post text should not repeat the title.
  The reason for this is that the blog list contains for each post

  - some formatted header data including the title and
  - the first few words of each post.

  And there we don't want to see the title another time.

  This does not apply to normal pages.  A normal page must provide a
  heading if it wants one to appear.
- Optional non-standard attributes for normal pages:

  - `prio`: For sorting in the navigation. Omit it if the page should
    not occur in the navigation.
  - `reference`: Name to use in the navigation.  Defaults to the title.
  - `refurl`: URL to use in the navigation instead of the position of
    the file.  Will be prepended with `site.baseurl`.  For use in the
    root page to avoid the trailing `"index.html"` in the URL.

- Normal pages may use an attribute "reference" if they don't want their
  title to be used in the navigation.
