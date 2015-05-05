# -*- coding: utf-8 -*-
import re
import unicodedata


def slugify(string):
    """
    Slugify a unicode string.

    Example:
    >>> slugify(u"Héllø Wörld")
    u"hello-world"
    """

    return re.sub(r'[-\s]+', '-',
            (re.sub(r'[^\w\s-]', '',string).strip().lower()))
