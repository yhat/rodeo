import matplotlib.pyplot as plt
import numpy as np
x = np.arange(0,100,0.00001)
y = x*np.sin(2*np.pi*x)
plt.plot(y)
plt.savefig("test.svg", format="svg")


