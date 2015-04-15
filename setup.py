import os
from setuptools import find_packages, setup

def extract_version():
    """
    Extracts version values from the main matplotlib __init__.py and
    returns them as a dictionary.
    """
    with open('rodeo/__init__.py') as fd:
        for line in fd.readlines():
            if (line.startswith('__version__')):
                exec(line.strip())
    return locals()["__version__"]


setup(
    name="rodeo",
    # Increase the version in ggplot/__init__.py
    version=extract_version(),
    author="Greg Lamp",
    author_email="greg@yhathq.com",
    url="https://github.com/yhat/rodeo/",
    license="BSD",
    packages=find_packages(),
    package_dir={"rodeo": "rodeo"},
    package_data={
        "rodeo": [
            "static/ace/snippets/*.js",
            "static/ace/*.js",
            "static/css/*",
            "static/fonts/*",
            "static/js/*.js",
            "static/js/lib/*.js",
            "static/js/lib/*.map",
            "static/plots/*",
            "templates/*.html",
            "templates/partials/*.html"
        ]
    },
    description="an ide for data analysis in python",
    # run pandoc --from=markdown --to=rst --output=README.rst README.md
    long_description=open("README.rst").read(),
    # numpy is here to make installing easier... Needs to be at the last position,
    # as that's the first installed with "python setup.py install"
    install_requires=[
        "ipython",
        "Flask"
    ],
    classifiers=['Intended Audience :: Science/Research',
                 'Intended Audience :: Developers',
                 'Programming Language :: Python',
                 'Topic :: Software Development',
                 'Topic :: Scientific/Engineering',
                 'Operating System :: Microsoft :: Windows',
                 'Operating System :: POSIX',
                 'Operating System :: Unix',
                 'Operating System :: MacOS',
                 'Programming Language :: Python :: 2',
                 'Programming Language :: Python :: 2.7',
                 'Programming Language :: Python :: 3',
                 'Programming Language :: Python :: 3.3'],
    zip_safe=False,
    entry_points={
        'console_scripts': [
            'rodeo = rodeo.cli:cmd',
        ]
    }
)

