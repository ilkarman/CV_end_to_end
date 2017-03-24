# Setup Flask, Gunicorn, Nginx on Ubuntu 

1. Using Azure Portal create VM Ubuntu Server 14.04 LTS (Standard DS2 v2 - only for this demo), then during 'creation' add 'inbound security rule' to 'network security group' called ('flaskrule') to allow inbound connections from port 80

2. After deployment add a custom DNS name label: "iliasmalltest.centralus.cloudapp.azure.com"

3. Create sample python-script:
	```
	mkdir flask_app
	cd flask_app
	mkdir logs
	mkdir static
	touch model.py
	```
	Enter the following into 'model.py':
	```
	from flask import Flask
	app = Flask(__name__)
	print("Something outside of @app.route() is always loaded")

	@app.route("/")
	def healthy_me():
		return "healthy"

	if __name__ == '__main__':
		# This is just for debugging
		app.run(host='0.0.0.0', port=5005)
	``

4. Pip install flask and gunicorn (to deploy flask):
	```
	sudo apt-get update
	sudo apt-get upgrade
	sudo apt-get install unattended-upgrades
	sudo apt-get install python3-pip
	sudo pip3 install flask
	sudo pip3 install gunicorn
	```

5. Try executing the sample app locally:
	```
	sudo apt-get install tmux
	tmux
	python3 model.py
	Ctrl+B+D
	curl http://0.0.0.0:5005 # get healthy
	tmux a -t 0
	Ctrl+C
	Ctrl+B+D

6. Make sure we have nginx and supervisor:
	```
	sudo apt-get install nginx supervisor
	```
7. Configure nginx to reverse-proxy an outside request from port 80 to inner port 5006 (this can be different to the debug port of 5005 we defined earlier), you could also use a socket instead of ports for a marginal speed-improvement:
	```
	sudo rm /etc/nginx/sites-enabled/default
	sudo nano /etc/nginx/sites-available/flaskconfig
	```
	Paste:
	```
	server {
	    listen 80;
	    server_name iliasmalltest.centralus.cloudapp.azure.com;

	    location = /favicon.ico { access_log off; log_not_found off; }

	    root /home/iliauk/flask_app;

	    access_log /home/iliauk/flask_app/logs/access.log;
	    error_log /home/iliauk/flask_app/logs/error.log;

	    location / {
	        proxy_set_header Host $http_host;
	        proxy_set_header X-Real-IP $remote_addr;
	        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	        proxy_set_header X-Forwarded-Proto $scheme;
	        proxy_pass http://0.0.0.0:5006;
	    }

	    location /static {
	        alias /home/iliauk/flask_app/static/;
	        autoindex on;
	    }
	}
	```
8. Start nginx with our new config:
	```
	sudo ln -s /etc/nginx/sites-available/flaskconfig /etc/nginx/sites-enabled/  # create sym link
	sudo nginx -t  # test is successful 
	sudo service nginx restart
	```

8. Setup supervisor (we could also use system to create unit|service|install instead) to keep our app running using gunicorn:
	```
	sudo nano /etc/supervisor/conf.d/flaskdeploy.conf
	```
	Paste:
	```
	[program:gunicorn]
	command = /usr/local/bin/gunicorn --workers 1 -m 007 --timeout 100000 --bind 0.0.0.0:5006 model:app
	directory = /home/iliauk/flask_app
	user = iliauk
	stdout_logfile = /home/iliauk/flask_app/logs/gunicorn_stdout.log
	stderr_logfile = /home/iliauk/flask_app/logs/gunicorn_stderr.log
	redirect_stderr = True
	environment = PRODUCTION=1
	```

9. Start the created service with supervisor:
	```
   	sudo supervisorctl reread  # gunicorn: available
    sudo supervisorctl update  # gunicorn: added process group
    sudo supervisorctl restart gunicorn
	sudo supervisorctl status  # gunicorn RUNNING pid 10127, uptime 0:00:07
	```

10. To check everything is running, on another computer go to your DNS <iliasmalltest.centralus.cloudapp.azure.com> and check that you see 'healthy' as the response