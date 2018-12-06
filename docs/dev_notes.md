Development Notes
=================


MAJOR ISSUES:
-------------
1. A 'setup' mechanism is needed to fetch all required data of authenticated user (e.g. profile info, social network, posts, etc...)
1. Must write initial dataset to users reference when a new account is created.
1. Fix `PostActions.updateAllPrivacy()` so it uses the 'posts' reference instead of 'lyddies'.
1. Clean up all the logic in `render()` of the LyddyStream component -- it's a mess.
1. MainPlayer hides when pressing its Pause button. (Pause button in list item doesn't affect MainPlayer.)
1. Properly restructure the reducers.

MINOR ISSUES:
-------------
1. When creating a new account, user should update the `Auth.displayName` attribute (otherwise, it's null)
1. Authentication mechanism conflicted when signed into two different browser tabs.
1. Country-restricted youtube videos don't play.

TO DO:
------
1. Notification when a Youtube link is copied to clipboard, and autofilled 'Post track' form
1. Follow/unfollow user feature
1. Profile page, with ability to update 'private', 'alias_name' attributes
1. Authentication settings to allow password reset or deleting account (without deleting posts, for now.)
1. Player could be controlled with keys (spacebar -> play/pause; arrows -> skip)
