Absolutely — I’d remove the unrelated `/aws/lambda/my-first-lambda-function` log-stream troubleshooting and keep the flow focused on **local Express server → AWS Lambda → JSON response → CloudWatch verification**.

 Triggering AWS Lambda from a Local Node.js Server

# Triggering an AWS Lambda Function from a Local Node.js Server

 This guide sets up a local Node.js server on port `3000` that invokes an AWS Lambda function and returns the Lambda response as JSON.

 ## Prerequisites

 Make sure you have:

 - Node.js and npm installed.
- An AWS account with a Lambda function.
- AWS credentials configured locally.
- Permission to invoke the target Lambda function.

 Configure AWS credentials if you have not already:

```
aws configure
```

 Alternatively, you can configure the following environment variables:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

 > Make sure the credentials have permission to invoke the Lambda function.

---

 ## Step 1: Create the Local Node.js Project

 Create a project directory and initialize it:

```
mkdir lambda-local-server
cd lambda-local-server
npm init -y
```

 Install Express and the AWS SDK:

```
npm install express @aws-sdk/client-lambda
```

---

 ## Step 2: Create the Local Express Server

 Create a file named `server.js`:

```
const express = require("express");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const app = express();

app.use(express.json());

// Change this to the AWS region where your Lambda function is deployed.
const lambdaClient = new LambdaClient({
    region: "us-east-1"
});

app.get("/trigger-lambda", async (req, res) => {
    try {
        const payload = {
            message: "Hello from local server on port 3000!"
        };

        const command = new InvokeCommand({
            FunctionName: "my-target-lambda-function",
            Payload: Buffer.from(JSON.stringify(payload)),
            InvocationType: "RequestResponse"
        });

        const response = await lambdaClient.send(command);

        // Decode the response returned by Lambda.
        const decoder = new TextDecoder("utf-8");
        const jsonResult = JSON.parse(
            decoder.decode(response.Payload)
        );

        res.status(200).json({
            success: true,
            lambdaResponse: jsonResult
        });

    } catch (error) {
        console.error("Error invoking Lambda:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Local server running on http://localhost:3000");
});
```

 Replace:

```
FunctionName: "my-target-lambda-function"
```

 with the actual name of your AWS Lambda function.

 Also make sure:

```
region: "us-east-1"
```

 matches the AWS region where your Lambda function is deployed.

---

 ## Step 3: Create the AWS Lambda Function

 In the AWS Lambda console, create a **Node.js** Lambda function.

 For this example, use the function name:

```
my-target-lambda-function
```

 Use the following handler code:

```
exports.handler = async (event) => {
    console.log(
        "Received event from local server:",
        JSON.stringify(event)
    );

    const incomingMessage =
        event.message || "No message provided";

    return {
        status: "success",
        reply: "Hello from AWS Lambda!",
        receivedData: incomingMessage,
        timestamp: new Date().toISOString()
    };
};
```

 Deploy the Lambda function before testing it from your local server.

---

 ## Step 4: Start the Local Server

 From your project directory, run:

```
node server.js
```

 You should see:

```
Local server running on http://localhost:3000
```

 Leave this terminal running.

---

 ## Step 5: Trigger the Lambda Function

 Open another terminal and call the local endpoint:

```
curl http://localhost:3000/trigger-lambda
```

 The request flow is:

```
Client
  │
  │ GET /trigger-lambda
  ▼
Local Express Server
  │
  │ AWS SDK InvokeCommand
  ▼
AWS Lambda
  │
  │ JSON response
  ▼
Local Express Server
  │
  │ JSON response
  ▼
Client
```

 You should receive a response similar to:

```
{
  "success": true,
  "lambdaResponse": {
    "status": "success",
    "reply": "Hello from AWS Lambda!",
    "receivedData": "Hello from local server on port 3000!",
    "timestamp": "2026-09-10T..."
  }
}
```

---

 ## Step 6: Verify the Lambda Logs

 After triggering the endpoint, open the Lambda function in the AWS console and go to its **Monitor** or **Logs** section.

 Open the associated CloudWatch log group and select the **most recent log stream**.

 CloudWatch may take several seconds to ingest the logs, so if the latest invocation is not visible immediately:

 1. Wait approximately 10–30 seconds.
2. Refresh the log stream.
3. Open the newest log stream if a newer one has appeared.

 You should see entries containing:

```
START
Received event from local server: {"message":"Hello from local server on port 3000!"}
END
```

 This confirms that:

 - The local Express server received the request.
- The local server successfully invoked AWS Lambda.
- Lambda received the JSON payload.
- Lambda executed successfully.
- The Lambda response was returned to the local server.
- The local server returned the response to the client.

 ## Complete Flow

 The final setup is:

```
curl / Browser / Postman
          │
          ▼
http://localhost:3000/trigger-lambda
          │
          ▼
   Local Express Server
          │
          │ AWS SDK
          ▼
   AWS Lambda Function
          │
          │ JSON response
          ▼
   Local Express Server
          │
          ▼
       Client
```

 This version keeps the steps that directly contribute to the working flow and includes the CloudWatch verification only where it makes sense: **after the Lambda has actually been invoked**.