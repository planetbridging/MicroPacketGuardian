# Micro Sensor SIEM

The Micro Sensor SIEM (Security Information and Event Management) is a robust system designed to monitor network traffic, capture packets, and apply advanced security analysis techniques. This project is tailored to provide real-time visibility into network activities, extract relevant information from packets, and generate valuable insights for network security analysis.

## Features (Indevelopment)

- **Packet Capture**: The system utilizes Packet Capture (PCAP) to intercept and log network traffic. This real-time visibility into network activities allows for immediate detection and response to potential threats.

- **Security Analysis**: Advanced security analysis techniques are applied to the captured packets. This enables the identification of potential threats, anomalies, and suspicious behavior patterns, enhancing the overall network security.

- **Granular Monitoring**: The system leverages micro sensor technology to perform fine-grained analysis at the packet level. This enhances security monitoring capabilities by providing detailed insights into each packet that traverses the network.

- **Event Correlation**: The system processes, correlates, and organizes the captured information to generate meaningful security insights and alerts. This allows for a comprehensive understanding of network activities and potential security threats.

- **Web Application Firewall (WAF)**: The system includes a WAF that listens to GET/POST requests, analyzes them, and detects user behavior patterns. This feature adds an additional layer of security by protecting the network from common web-based threats.

![Diagram](./micropacketguadian.jpg)

The above diagram illustrates the flow of the system. User requests are intercepted by the Proxy Server, which then forwards the requests to the Target Service. The Proxy Server is initialized by the Startup Function and handles requests using the Proxy Middleware and the HTTP/HTTPS Server. The Proxy Middleware listens to GET/POST requests and packets using PCAP, and sends them to the Web Application Firewall (WAF). The WAF analyzes these requests and sends them to the Pattern Recognition system, which detects user behavior patterns and sends this information back to the WAF.

## Usage

1. Clone the repository:

```shell
git clone https://github.com/planetbridging/MicroPacketGuardian.git
```
