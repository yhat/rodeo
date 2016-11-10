import matplotlib.pyplot as plt
import numpy as np

plt.figure(figsize=[6,6])
x = np.arange(0,100,0.00001)
y = x*np.sin(2*pi*x)
plt.plot(y)
plt.axis('off')
plt.gca().set_position([0, 0, 1, 1])
plt.savefig("test.svg")
