from ggplot import *

ggplot(mtcars, aes(x='wt', y='mpg')) + \
    geom_point() + \
    geom_line() + \
    ggtitle("Greg is the best!")