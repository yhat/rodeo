import numpy as np
import pandas
columns = ['some', 'column', 'headers']
index = np.arange(103) # array of numbers for the number of samples
df = pandas.DataFrame(columns=columns, index = index)