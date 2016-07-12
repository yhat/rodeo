# Press COMMAND + ENTER to run a single line in the console
print 'Welcome to Rodeo!'

# Press COMMAND + ENTER with text selected to run multiple lines
# For example, select the following lines
x = 7
x**2
# and remember to press COMMAND + ENTER

# You can also run code directly in the console below.

#####################################################################################
# Here is an example of using Rodeo:

# We'll use the popular package called Pandas
# Install it with pip
import pip
pip.main(['install', 'pandas'])

# Import it as 'pd'
import pandas as pd

# Create a dataframe
df=pd.DataFrame({"Animal":["dog","dolphin","chicken","ant","spider"],"Legs":[4,0,2,6,8]})
df.head()

#####################################################################################
# An example of making a plot:

pip.main(['install', 'ggplot'])
from ggplot import ggplot, aes, geom_bar

ggplot(df, aes(x="Animal", weight="Legs")) + geom_bar(fill='blue')

# Find this tutorial helpful?  Checkout the blue sidebar for more tutorials!
