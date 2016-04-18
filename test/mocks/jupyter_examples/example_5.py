# This should cause a name error
import numpy
import toyplot

x = numpy.linspace(0, 10)
y = x ** 2

canvas = toyplot.Canvas(width=300, height=300)
mark = axes.plot(x, y)