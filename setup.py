from setuptools import find_packages, setup



setup(
    name='mlproject',
    version='0.1.0',
    author='Arohi',
    author_email='2k23.csaiml2312942@gmail.com',
    packages=find_packages()
    install_requires=['pandas', 'numpy', 'scikit-learn', 'joblib', 'seaborn', 'matplotlib']
)