Absolutely — here is the complete, cleaned-up `README.md` with the **local Windows commands, project upload, EC2 setup, PM2, and testing** all in one flow.

 README.md — Express App Deployment to Amazon EC2

# Express App Deployment to Amazon EC2

 This guide walks through deploying a Node.js/Express application to an **Amazon Linux 2023 EC2 instance** from a Windows machine.

 The workflow is:

```
Windows PC
   │
   ├── SSH private key (.pem)
   └── Express application
          │
          │ SCP
          ▼
Amazon EC2
   │
   ├── Node.js
   ├── npm
   ├── Express
   └── PM2
          │
          ▼
    Running Express App
```

---

 ## Prerequisites

 Before starting, make sure you have:

 - A running **Amazon Linux 2023 EC2 instance**
- The instance's public IPv4 address
- Your EC2 private key (`.pem`)
- A Node.js/Express project
- Windows Command Prompt or PowerShell
- Port `22` open in the EC2 security group for SSH
- Port `80` open if you want to access the application through `http://<PUBLIC-IP>`

 Example project:

```
my-express-app/
├── server.js
├── package.json
└── ...
```

---

 # Step 1 — Navigate to Your Local Download Directory

 Open **Command Prompt** on your Windows machine.

 Navigate to your Downloads folder:

```
cd %USERPROFILE%\Downloads
```

 Check the contents:

```
dir
```

 You should have something similar to:

```
Downloads/
├── my-express-server.pem
└── my-express-app/
    ├── server.js
    ├── package.json
    └── ...
```

---

 # Step 2 — Secure Your Private Key Permissions

 Windows SSH requires the private key to have appropriate permissions.

 Remove inherited permissions from your `.pem` file:

```
icacls my-express-server.pem /inheritance:r
```

 Grant read-only access to your current Windows user:

```
icacls my-express-server.pem /grant:r %USERNAME%:R
```

 You can verify the permissions with:

```
icacls my-express-server.pem
```

---

 # Step 3 — Test the SSH Connection

 Connect to your EC2 instance:

```
ssh -i my-express-server.pem ec2-user@13.60.96.93
```

 Replace:

```
13.60.96.93
```

 with your EC2 instance's current public IPv4 address.

 For Amazon Linux 2023, the default SSH username is:

```
ec2-user
```

 If the connection is successful, you should see a shell similar to:

```
[ec2-user@ip-xxx-xxx-xxx-xxx ~]$
```

 Exit the server:

```
exit
```

---

 # Step 4 — Upload the Project to EC2

 Now upload your entire Express project from Windows to the EC2 instance using `scp`.

 Make sure you are in the directory containing both your `.pem` file and project folder:

```
cd %USERPROFILE%\Downloads
```

 Upload the project:

```
scp -i my-express-server.pem -r my-express-app ec2-user@13.60.96.93:/home/ec2-user/
```

 Replace `13.60.96.93` with your EC2 public IP address.

 The `-r` option means **recursive**, allowing the entire project directory and its contents to be uploaded.

 After the upload completes, you should have:

```
/home/ec2-user/my-express-app/
```

 on the EC2 instance.

---

 # Step 5 — Connect to EC2

 Connect to the instance again:

```
ssh -i my-express-server.pem ec2-user@13.60.96.93
```

 Check your home directory:

```
ls
```

 You should see:

```
my-express-app
```

 Navigate into the application:

```
cd my-express-app
```

 Check the project files:

```
ls
```

 You should see something similar to:

```
server.js
package.json
```

---

 # Step 6 — Install Node.js and npm

 Update the Amazon Linux packages:

```
sudo dnf update -y
```

 Install Node.js and npm:

```
sudo dnf install -y nodejs npm
```

 Verify Node.js:

```
node --version
```

 Verify npm:

```
npm --version
```

---

 # Step 7 — Install Project Dependencies

 Make sure you are inside your application directory:

```
cd ~/my-express-app
```

 If your project already contains a `package.json`, install all declared dependencies:

```
npm install
```

 If Express is not already listed as a dependency, install it:

```
npm install express
```

 After installation, your project will contain a `node_modules` directory:

```
my-express-app/
├── node_modules/
├── package-lock.json
├── package.json
├── server.js
└── ...
```

 > **Important:** You generally do not need to upload `node_modules` from Windows. Install dependencies directly on the EC2 instance with `npm install`.

---

 # Step 8 — Test the Express Application

 Before configuring PM2, test the application directly.

 Start the server:

```
node server.js
```

 If your application starts successfully, you should see your application's startup message.

 Open another terminal and connect to the EC2 instance, or stop the server with:

```
Ctrl+C
```

 Then test the application locally:

```
curl -i http://localhost/
```

 If your Express application is running on another port, for example `3000`, use:

```
curl -i http://localhost:3000/
```

 A successful response should look similar to:

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
...
```

---

 # Step 9 — Install PM2

 PM2 keeps your Node.js application running after you disconnect from SSH.

 Install PM2 globally:

```
sudo npm install -g pm2
```

 Verify the installation:

```
pm2 --version
```

---

 # Step 10 — Start the Application with PM2

 Make sure you are inside your application directory:

```
cd ~/my-express-app
```

 Start the application:

```
pm2 start server.js --name "express-app"
```

 Check the PM2 process:

```
pm2 status
```

 You should see something similar to:

```
┌────┬──────────────┬─────────┬────────┐
│ id │ name         │ mode    │ status │
├────┼──────────────┼─────────┼────────┤
│ 0  │ express-app  │ fork    │ online │
└────┴──────────────┴─────────┴────────┘
```

---

 # Step 11 — Test the Application Through PM2

 Test the application locally:

```
curl -i http://localhost/
```

 If your Express application uses port `3000`:

```
curl -i http://localhost:3000/
```

 You can also check the PM2 logs:

```
pm2 logs express-app
```

 Press:

```
Ctrl+C
```

 to exit the logs.

---

 # Step 12 — Save the PM2 Process

 Save the current PM2 process list:

```
pm2 save
```

 This allows PM2 to remember which applications should be running after a reboot.

---

 # Step 13 — Configure PM2 to Start on Boot

 Generate the PM2 system startup configuration:

```
pm2 startup
```

 PM2 will display a command similar to:

```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

 **Copy and execute the exact command that PM2 displays.**

 Then save the process list again:

```
pm2 save
```

 Verify the process:

```
pm2 status
```

 Your application should show:

```
online
```

---

 # Step 14 — Configure Express for External Connections

 If you want to access the application through the EC2 public IP, make sure Express is listening on an externally accessible interface.

 For example:

```
const express = require("express");

const app = express();
const PORT = 80;

app.get("/", (req, res) => {
    res.send("Hello from Express on EC2!");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
```

 The important part is:

```
"0.0.0.0"
```

 This allows the server to accept connections from outside the EC2 instance.

 > If your application listens on port `3000` instead, use `3000` consistently throughout the configuration and testing steps.

---

 # Step 15 — Configure the EC2 Security Group

 Your EC2 security group's inbound rules must allow traffic to the port your application uses.

 For a standard HTTP application on port `80`, allow:

```
Type:       HTTP
Protocol:   TCP
Port:       80
Source:     0.0.0.0/0
```

 For an application running directly on port `3000`, allow:

```
Type:       Custom TCP
Protocol:   TCP
Port:       3000
Source:     0.0.0.0/0
```

 SSH should also be allowed on port `22`, preferably restricted to your own IP address where practical.

---

 # Step 16 — Test Local Connectivity

 From the EC2 instance, test the application:

```
curl -i http://localhost/
```

 If using port `3000`:

```
curl -i http://localhost:3000/
```

 If this works, your Express application is running locally on the server.

---

 # Step 17 — Test Public Connectivity

 From your Windows computer, open a browser and navigate to:

```
http://13.60.96.93
```

 Replace the IP address with your EC2 instance's public IPv4 address.

 If your application is running on port `3000`, use:

```
http://13.60.96.93:3000
```

 Use the explicit `http://` protocol if your browser attempts to redirect the request to HTTPS.

---

 # Step 18 — Useful PM2 Commands

 Check running applications:

```
pm2 status
```

 View application logs:

```
pm2 logs express-app
```

 Restart the application:

```
pm2 restart express-app
```

 Stop the application:

```
pm2 stop express-app
```

 Start the application again:

```
pm2 start express-app
```

 Remove the application from PM2:

```
pm2 delete express-app
```

 Save the current process list:

```
pm2 save
```

---

 # Updating the Application

 When you make changes to your local project, you can upload the updated files again.

 From Windows:

```
cd %USERPROFILE%\Downloads
```

 Upload the project:

```
scp -i my-express-server.pem -r my-express-app ec2-user@13.60.96.93:/home/ec2-user/
```

 Then connect to EC2:

```
ssh -i my-express-server.pem ec2-user@13.60.96.93
```

 Navigate to the project:

```
cd ~/my-express-app
```

 Install any new dependencies:

```
npm install
```

 Restart the application:

```
pm2 restart express-app
```

 Check the logs:

```
pm2 logs express-app
```

---

 # Complete Command Reference

 ## Windows — Initial Setup

```
cd %USERPROFILE%\Downloads

icacls my-express-server.pem /inheritance:r

icacls my-express-server.pem /grant:r %USERNAME%:R
```

 ## Windows — Upload Project

```
scp -i my-express-server.pem -r my-express-app ec2-user@13.60.96.93:/home/ec2-user/
```

 ## Windows — Connect to EC2

```
ssh -i my-express-server.pem ec2-user@13.60.96.93
```

 ## EC2 — Install Node.js

```
sudo dnf update -y
sudo dnf install -y nodejs npm
```

 ## EC2 — Install Dependencies

```
cd ~/my-express-app
npm install
```

 ## EC2 — Install PM2

```
sudo npm install -g pm2
```

 ## EC2 — Start Application

```
pm2 start server.js --name "express-app"
```

 ## EC2 — Save PM2 Configuration

```
pm2 save
```

 ## EC2 — Configure Startup

```
pm2 startup
```

 Then execute the command PM2 provides and run:

```
pm2 save
```

 ## EC2 — Test Application

```
curl -i http://localhost/
```

 ## EC2 — Check PM2

```
pm2 status
```

 ## EC2 — View Logs

```
pm2 logs express-app
```

---

 # Troubleshooting

 ## SSH Permission Error

 If SSH complains about the private key permissions, run:

```
icacls my-express-server.pem /inheritance:r
icacls my-express-server.pem /grant:r %USERNAME%:R
```

---

 ## `scp` Cannot Find the Project

 Make sure you are in your Downloads directory:

```
cd %USERPROFILE%\Downloads
```

 Then check:

```
dir
```

 You should see:

```
my-express-server.pem
my-express-app
```

---

 ## `npm` or `node` Is Not Found

 Install Node.js and npm:

```
sudo dnf install -y nodejs npm
```

 Then verify:

```
node --version
npm --version
```

---

 ## Application Works with `curl` but Not in Browser

 If this works:

```
curl -i http://localhost/
```

 but the browser cannot connect, check:

 1. The EC2 security group allows inbound traffic on the application port.
2. Express is listening on `0.0.0.0`.
3. The EC2 instance has a public IPv4 address.
4. You are using the correct public IP address.
5. You are using the correct port.
6. The EC2 network configuration allows the traffic.

---

 ## Application Stops After Closing SSH

 Make sure the application is running under PM2:

```
pm2 status
```

 If necessary:

```
pm2 start server.js --name "express-app"
pm2 save
```

 Configure startup:

```
pm2 startup
```

 Then execute the command PM2 provides and save again:

```
pm2 save
```

---

 # Final Deployment Checklist

 Before considering the deployment complete, verify:

 - [ ] `.pem` file permissions are configured
- [ ] SSH connection works
- [ ] Project uploaded with `scp`
- [ ] Project exists at `~/my-express-app`
- [ ] Node.js is installed
- [ ] npm is installed
- [ ] Project dependencies are installed
- [ ] Express application runs successfully
- [ ] PM2 is installed
- [ ] Application is running under PM2
- [ ] PM2 process list is saved
- [ ] PM2 startup configuration is enabled
- [ ] Express listens on `0.0.0.0`
- [ ] EC2 security group allows the application port
- [ ] `curl http://localhost/` succeeds
- [ ] Public browser access works

---

 # Deployment Flow

 The complete process can be summarized as:

```
1. Windows
   │
   ├── Locate .pem
   ├── Secure .pem permissions
   └── Test SSH
        │
        ▼
2. Upload Application
   │
   └── scp -r my-express-app ...
        │
        ▼
3. EC2
   │
   ├── Install Node.js
   ├── Install npm
   ├── cd ~/my-express-app
   └── npm install
        │
        ▼
4. PM2
   │
   ├── pm2 start server.js
   ├── pm2 save
   └── pm2 startup
        │
        ▼
5. Networking
   │
   ├── Express → 0.0.0.0
   ├── Security Group → Application Port
   └── Public IPv4
        │
        ▼
6. Browser
   │
   └── http://<EC2-PUBLIC-IP>
```

 I also corrected the flow so that **uploading the project happens before installing its dependencies**, which is the more natural deployment sequence.