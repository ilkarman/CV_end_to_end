from os import environ

import os

# Hack to get the library picked up by Python
os.environ["PATH"] = r"D:\home\site\wwwroot\env\lib\site-packages\numpy\core;D:\home\site\wwwroot\MXNET\lib;D:\home\site\wwwroot\MXNET\3rdparty\cudnn;D:\home\site\wwwroot\MXNET\3rdparty\cudnn\bin;D:\home\site\wwwroot\MXNET\3rdparty\cudart;D:\home\site\wwwroot\MXNET\3rdparty\vc;D:\home\site\wwwroot\MXNET\3rdparty\gnuwin;D:\home\site\wwwroot\MXNET\3rdparty\openblas\bin;D:\home\site\wwwroot\env\Scripts;" + os.environ['PATH']

from WebApp import *

if __name__ == '__main__':

    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT)