import re
import unicodedata


def slugify(string):
    """
    Slugify a unicode string.

    Example:
    >>> slugify(u"Hello World")
    u"hello-world"
    """

    return re.sub(r'[-\s]+', '-',
            (re.sub(r'[^\w\s-]', '',string).strip().lower()))
