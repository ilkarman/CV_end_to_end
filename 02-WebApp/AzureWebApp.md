# Installing Python 3.5 (x64) and MXNet on Azure Web Apps

Result: http://ikwebappdemo.azurewebsites.net/

## A - Prepare Material

1. Create a folder-structure like the below:
	```
	-WebAppDemo
	--WebApp
	---templates
	```

2. Create another (temporary) folder-structure like below, we will use this for software and packages that are not related to our code because we don't want to clutter our local git repo
	```
	-FTPWebAppTemp
	--Wheels
	--MXNET
	--MXNetUpdate
	```

3. From http://www.lfd.uci.edu/~gohlke/pythonlibs, download the following packages (or any others that you require) into the FTPWebAppTemp/Wheels folder:
	```
	numpy-1.12.0+mkl-cp35-cp35m-win_amd64.whl
	pandas-0.19.2-cp35-cp35m-win_amd64.whl
	Pillow-4.0.0-cp35-cp35m-win_amd64.whl
	scikit_learn-0.18.1-cp35-cp35m-win_amd64.whl
	scipy-0.19.0rc1-cp35-cp35m-win_amd64.whl
	```

4. Create a text-file called something like FTPWebAppTemp/requirements.txt and paste in the following:
	```
	Flask==0.11.1
	Wheels\numpy-1.12.0+mkl-cp35-cp35m-win_amd64.whl
	Wheels\pandas-0.19.2-cp35-cp35m-win_amd64.whl
	Wheels\Pillow-4.0.0-cp35-cp35m-win_amd64.whl
	Wheels\scikit_learn-0.18.1-cp35-cp35m-win_amd64.whl
	Wheels\scipy-0.19.0rc1-cp35-cp35m-win_amd64.whl
	```

5. Download the latest MXNet base build ("20160531_win10_x64_cpu.7z"): https://github.com/dmlc/mxnet/releases/download/20160531/20160531_win10_x64_cpu.7z and unzip the contents into the FTPWebAppTemp/MXNet folder

6. Go to https://github.com/yajiedesign/mxnet/releases/ and download the latest nightly build of MXNet, which for me is: "20170220_mxnet_x64_vc14_cpu.7z" and extract the contents into the FTPWebAppTemp/MXNetUpdate folder

7. Create a text-file called ```__init__.py``` in the WebAppDemo/WebApp folder and paste in the following:
	```
	from flask import Flask

	app = Flask(__name__)

	import WebApp.model
	```

8. Create a text-file called "model.py" in the WebAppDemo/WebApp folder and paste in the following:
	```
	from flask import render_template
	import PIL
	import scipy
	import sklearn
	import mxnet as mx
	import numpy as np
	from WebApp import app

	@app.route("/")
	def index():
		message = "Hello World!"
	    return render_template('index.html', **locals())
	```

9. Create a text-file called "index.html" in WebAppDemo/WebApp/Templates and paste in the following:
	```
	<!DOCTYPE html> <html lang="en">
	<html>
	<head>
	    <title>My Website</title>
	</head>
	<body>
		<div class="block1">
		<h1>{{message}}</h1>
	</body>
	</html>
	```

	You should now have a folder-structure that looks like:

	```
	-WebAppDemo
	--WebApp
	---__init__.py
	---model.py
	---templates
	----index.html
	```

	```
	-FTPWebAppTemp
	--requirements.txt
	--Wheels
	---numpy-1.12.0+mkl-cp35-cp35m-win_amd64.whl
	---pandas-0.19.2-cp35-cp35m-win_amd64.whl
	---Pillow-4.0.0-cp35-cp35m-win_amd64.whl
	---scikit_learn-0.18.1-cp35-cp35m-win_amd64.whl
	---scipy-0.19.0rc1-cp35-cp35m-win_amd64.whl
	---...
	--MXNET
	---python
	---setupenv.cmd
	---...
	--MXNetUpdate
	---python
	---...
	```

## B - Create Azure Web-App and Configure

10. Create a web-app and upload this local repo by running the following Azure CLI commands in the "WebAppDemo" folder:
	```
	cd WebAppDemo
	azure login
	azure config mode asm
	azure site create --git ikwebappdemo
	git add -A
	git commit -m "init"
	git push azure master
	```

	If you don't already have a git user-name configured for Azure then you will need to manually create a Web App using Azure Portal and go to the "Deployment Credentials" blade to setup your credentials

11. Use an FTP client such as FileZilla to connect to your website using FTP and copy the contents of the FTPWebAppTemp folder into '/site/wwwroot'. If you go to the "Properties" blade, you should see your credentials - FTP USER: "ikwebappdemo\ikflask2", FTP HOST: "ftp://waws-prod-sn1-003.ftp.azurewebsites.windows.net"

12. Under the "Application settings" blade set "Always On" to "On".

13. Click on the "Scale up (App Service plan)" blade and select your desired plan, which for me is "S2"

14. Scroll down to the "Extensions" blade, click on "Add" and locate the latest version of Python, which for me is "Python 3.5.3 x64" and add it.

## C - Install packages

15. Scroll down to the "Advanced Tools" blade, in the Kudu menu select "Debug Console" -> "CMD"

16. Check we have the latest version of Python installed:

	```D:\home\Python35\python.exe -V # Python 3.5.3rc1```

17. Install the virtualenv module

	```D:\home\Python35\python.exe -m pip install virtualenv```

18. Create a virtual-environment in your 'wwwroot'. We have to create this without-pip and manually install it later. *This step is important because if we try to create the virtual-environment with pip the process will not work!*
	```
	cd D:\home\site\wwwroot
	D:\home\Python35\python.exe -m venv --without-pip env
	```

19. Activate your virtual environment and install pip as described at https://pip.pypa.io/en/stable/installing/
	```
	env\Scripts\activate

	(env) python -V  # Python 3.5.3rc1
	(env) curl https://bootstrap.pypa.io/get-pip.py | python
	(env) pip --version  # pip 9.0.1
	```

20. Install our dependencies:

	```(env) pip install -r requirements.txt```

21. Install MXNet:
	```
	set MXNET_HOME="D:\home\site\wwwroot\MXNET"
	set PATH=%MXNET_HOME%\lib;%MXNET_HOME%\3rdparty\cudnn\bin;%MXNET_HOME%\3rdparty\cudart;%MXNET_HOME%\3rdparty\vc;%MXNET_HOME%\3rdparty\gnuwin;%MXNET_HOME%\3rdparty\openblas\bin;%MXNET_HOME%\lib;%MXNET_HOME%\3rdparty\cudnn\bin;%MXNET_HOME%\3rdparty\cudart;%MXNET_HOME%\3rdparty\vc;%MXNET_HOME%\3rdparty\gnuwin;%MXNET_HOME%\3rdparty\openblas\bin;%DEPLOYMENT_TARGET%\env\scripts;%PATH%

	(env) cd MXNET\python
	(env) python setup.py install
	(env) pip freeze -> mxnet 0.5.0
	```

22. Install MXNet Nightly build:
	```
	(env) cd MXNetUpdate\python 
	(env) python setup.py install
	(env) pip freeze -> mxnet 0.9.4
	(env) deactivate
	```

	We can also now delete the MXNetUpdate folder

## D - Web-Server

23. In the 'wwwroot' folder we need to create a configuration file that will point to our python app:
	```
	cd wwwroot
	touch web.config
	```

	Then paste in the below (using the file-navigator above the command-prompt):

	```
	<?xml version="1.0" encoding="utf-8"?>
	<configuration>
	  <system.webServer>
	    <handlers>
	      <add name="PythonHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified"/>
	    </handlers>
	    <httpPlatform processPath="D:\home\site\wwwroot\env\Scripts\python.exe"
	                  arguments="D:\home\site\wwwroot\runserver.py --port %HTTP_PLATFORM_PORT%"
	                  stdoutLogEnabled="true"
	                  stdoutLogFile="D:\home\site\wwwroot\logs\log_file2.log"
	                  startupTimeLimit="220"
	                  processesPerApplication="5">
	      <environmentVariables>
	        <environmentVariable name="SERVER_PORT" value="%HTTP_PLATFORM_PORT%" />
	      </environmentVariables>
	    </httpPlatform>
	  </system.webServer>
	</configuration>
	```

24. We also want to collect logs so `mkdir logs` in the 'wwwroot' folder

25. Finally we create the python server, and manually append the packages to the path:
	```
	cd wwwroot
	touch runserver.py
	```

	And paste in the below:

	```
	import os

	# Hack to get the library picked up by Python
	os.environ["PATH"] = r"D:\home\site\wwwroot\env\lib\site-packages\numpy\core;D:\home\site\wwwroot\MXNET\lib;D:\home\site\wwwroot\MXNET\3rdparty\cudnn;D:\home\site\wwwroot\MXNET\3rdparty\cudnn\bin;D:\home\site\wwwroot\MXNET\3rdparty\cudart;D:\home\site\wwwroot\MXNET\3rdparty\vc;D:\home\site\wwwroot\MXNET\3rdparty\gnuwin;D:\home\site\wwwroot\MXNET\3rdparty\openblas\bin;D:\home\site\wwwroot\env\Scripts;" + os.environ['PATH']

	from WebApp import *

	if __name__ == '__main__':

	    HOST = os.environ.get('SERVER_HOST', 'localhost')
	    try:
	        PORT = int(os.environ.get('SERVER_PORT', '5555'))
	    except ValueError:
	        PORT = 5555
	    app.run(HOST, PORT)
	```

26. Head back to the "Overview" blade and restart your service and then click on "Browse", you should see:

	```
	Hello World!
	```

	If anything goes wrong using the Kudu console (or FTP) head to wwwroot/logs to see the python error.

27. You can now modify the code to create your own web-app and bring in any extra packages your code requires
